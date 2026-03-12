# Plano de Melhorias — LerTraça

Baseado na code review feita em 08/03/2026. Organizado por prioridade.

---

## 1. Crítico

### 1.1 Race condition em `spendCoins`

**Arquivo:** `src/lib/services/gamification.ts` (linhas 62-78)

**Problema:** O código faz um `findUnique` para checar o saldo e depois um `update` para decrementar. Entre essas duas operações, outra request pode passar pelo mesmo check e gastar os mesmos coins — clássico TOCTOU (time-of-check-time-of-use).

```ts
// ATUAL (vulnerável)
const user = await db.user.findUnique({ where: { id: userId }, select: { coins: true } })
if (!user || user.coins < coins) return false
await db.user.update({ where: { id: userId }, data: { coins: { decrement: coins } } })
```

**Fix:** Usar uma raw query atômica ou transaction com condição no WHERE:

```ts
// CORRIGIDO
export async function spendCoins(userId: string, coins: number): Promise<boolean> {
  if (coins <= 0) return false

  const result = await db.user.updateMany({
    where: { id: userId, coins: { gte: coins } },
    data: { coins: { decrement: coins } },
  })

  return result.count > 0
}
```

O `updateMany` com `where: { coins: { gte: coins } }` é atômico no PostgreSQL — se o saldo não for suficiente no momento da execução, `count` retorna 0.

---

### 1.2 `checkAchievements` é um gargalo de performance

**Arquivo:** `src/lib/services/gamification.ts` (linhas 80-92)

**Problema:** Toda ação do usuário (adicionar livro, avaliar, anotar, seguir) chama `awardPoints` → que chama `checkAchievements` → que:

1. Busca TODOS os achievements do banco
2. Roda `getUserStats` que dispara 9 queries paralelas + 1 query extra para streak
3. Faz loop em todos os achievements verificando cada um
4. Para cada achievement conquistado, roda outro upsert + transaction

São ~15+ queries no banco a cada ação do usuário. Isso vai matar a performance conforme o app cresce.

**Fix em etapas:**

**Etapa A — Cache dos achievements (eles quase nunca mudam):**

```ts
import { unstable_cache } from 'next/cache'

const getCachedAchievements = unstable_cache(
  () => db.achievement.findMany(),
  ['all-achievements'],
  { revalidate: 3600 } // 1 hora
)
```

**Etapa B — Só checar achievements relevantes por ação:**

Criar um mapeamento `action → achievement categories` para não checar tudo toda vez:

```ts
const ACTION_ACHIEVEMENT_MAP: Record<PointsAction, string[]> = {
  BOOK_ADDED: ['collection'],
  BOOK_FINISHED: ['reading'],
  BOOK_RATED: ['reading'],
  ANNOTATION_CREATED: ['collection'],
  QUOTE_SHARED: ['collection'],
  FIRST_FOLLOWER: ['social'],
  // ...
}

export async function checkAchievements(userId: string, action?: PointsAction) {
  const allAchievements = await getCachedAchievements()
  const categories = action ? ACTION_ACHIEVEMENT_MAP[action] : null
  const relevantAchievements = categories
    ? allAchievements.filter((a) => categories.includes(a.category))
    : allAchievements

  // ... só checar os relevantes
}
```

**Etapa C — Só buscar stats necessárias:**

Em vez de rodar todas as 9 queries de `getUserStats`, só buscar as stats que os achievements filtrados precisam. Pode criar um set dos `requirement` keys dos achievements relevantes e só rodar as queries correspondentes.

**Etapa D — Debounce no lado do servidor (opcional, futuro):**

Se quiser ir mais longe, usar uma fila (ex: Inngest, QStash) para processar achievement checks de forma assíncrona.

---

### 1.3 Sem rate limiting

**Arquivos afetados:** Todos os server actions e API routes.

**Problema:** Um usuário pode chamar `toggleLike`, `submitComment`, `addBookToShelf`, etc. sem limite. Bots ou usuários mal-intencionados podem abusar.

**Fix:** Usar `upstash/ratelimit` (funciona no edge, serverless-friendly):

```bash
pnpm add @upstash/ratelimit @upstash/redis
```

Criar um helper:

```ts
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'), // 10 requests por minuto
})

// Versão mais restrita para ações sociais
export const socialRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '60 s'),
})
```

Usar nos actions:

```ts
const { success } = await socialRateLimiter.limit(user.id)
if (!success) return { success: false, error: 'Muitas requisições. Tente novamente em breve.' }
```

**Alternativa sem Upstash (mais simples, menos robusta):** usar um Map em memória com TTL. Funciona para dev e low-traffic, mas não sobrevive a múltiplas instâncias serverless.

---

## 2. Importante

### 2.1 Padrão de auth inconsistente em `social.ts`

**Arquivo:** `src/lib/actions/social.ts`

**Problema:** `book.ts` usa `getAuthenticatedUser()` (que faz throw se não autenticado), mas `social.ts` repete o pattern inline em cada função:

```ts
const session = await auth()
if (!session?.user?.id) return { success: false, error: 'Não autorizado' }
```

**Fix:** Mover `getAuthenticatedUser` para um arquivo compartilhado e usar em todos os actions:

```ts
// src/lib/actions/helpers.ts
import { auth } from '@/lib/auth'

export async function getAuthenticatedUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Não autenticado')
  }
  return session.user
}
```

Depois substituir em `social.ts` o pattern repetido. O try/catch já presente em cada action vai capturar o throw e retornar o erro corretamente.

---

### 2.2 Import dinâmico desnecessário em `social.ts`

**Arquivo:** `src/lib/actions/social.ts` (linhas 64, 159, 199)

**Problema:**

```ts
const { db } = await import('@/lib/db')
```

Isso aparece dentro de `toggleLike`, `shareQuote` e `createPost`, mas não nas outras funções do mesmo arquivo. Parece ser um acidente — `db` deveria ser importado normalmente no topo do arquivo, como é feito em `book.ts`.

**Fix:** Adicionar `import { db } from '@/lib/db'` no topo e remover os 3 dynamic imports.

---

### 2.3 Stats computadas em memória em vez do banco

**Arquivo:** `src/lib/services/stats.ts`

**Problema:** `getUserAuthorStats`, `getUserPublisherStats`, `getUserCategoryStats` buscam TODOS os userBooks e fazem a agregação em JavaScript:

```ts
const userBooks = await db.userBook.findMany({ where: { userId } })
const authorCounts: Record<string, number> = {}
userBooks.forEach(ub => { ... }) // contando manualmente
```

`getUserReadingStats` também carrega todos os books com relação `book` completa só pra contar status e somar páginas.

Para um usuário com 500+ livros, isso é memória e tempo desnecessários.

**Fix para `getUserReadingStats`:**

```ts
const [statusCounts, pagesAgg, spentAgg, ratingAgg, rereadCount] = await Promise.all([
  db.userBook.groupBy({
    by: ['status'],
    where: { userId, isReread: false },
    _count: true,
  }),
  db.userBook.findMany({
    where: { userId, isReread: false, status: 'READ' },
    select: { book: { select: { pageCount: true } } },
  }),
  db.userBook.aggregate({
    where: { userId, isReread: false },
    _sum: { acquisitionValue: true },
  }),
  db.userBook.aggregate({
    where: { userId, isReread: false, rating: { not: null } },
    _avg: { rating: true },
    _count: { rating: true },
  }),
  db.userBook.count({ where: { userId, isReread: true } }),
])
```

**Fix para author/publisher/category:** Como `authors` e `categories` são arrays no PostgreSQL, o Prisma não consegue fazer `groupBy` neles diretamente. Duas opções:

- **Opção A (recomendada agora):** Usar `$queryRaw` para unnest os arrays no PostgreSQL:

```ts
const authorStats = await db.$queryRaw<AuthorStats[]>`
  SELECT unnest(b.authors) as name, COUNT(*) as count
  FROM user_book ub
  JOIN book b ON ub.book_id = b.id
  WHERE ub.user_id = ${userId} AND ub.is_reread = false
  GROUP BY name
  ORDER BY count DESC
  LIMIT ${limit}
`
```

- **Opção B (futuro, mais limpo):** Criar tabelas `BookAuthor` e `BookCategory` como join tables, permitindo queries normais com Prisma.

---

### 2.4 Indexes faltando no banco

**Arquivo:** `prisma/schema.prisma`

**Problema:** As queries mais frequentes do app não têm indexes dedicados. O PostgreSQL vai fazer sequential scans conforme os dados crescem.

**Fix:** Adicionar os seguintes indexes:

```prisma
model UserBook {
  // ... campos existentes

  @@index([userId, status])          // shelf page, stats queries
  @@index([userId, bookId])          // busca de livro específico do usuário
  @@index([userId, createdAt])       // ordenação da estante
  @@index([userId, finishDate])      // stats mensais, retrospectiva
}

model FeedPost {
  // ... campos existentes

  @@index([userId, createdAt])       // feed do usuário, perfil público
  @@index([createdAt])               // feed global ordenado
}

model Notification {
  // ... campos existentes

  @@index([userId, read])            // contagem de não lidas
  @@index([userId, createdAt])       // listagem ordenada
}

model Like {
  // ... campos existentes

  @@index([userId])                  // "posts que eu curti"
}

model PointsLog {
  // ... campos existentes

  @@index([userId, createdAt])       // histórico de pontos
}
```

Depois rodar `npx prisma migrate dev --name add_indexes`.

---

### 2.5 Cursor de paginação do feed usa `createdAt`

**Arquivo:** `src/lib/services/feed.ts` (linha 75)

**Problema:**

```ts
...(cursor ? { createdAt: { lt: new Date(cursor) } } : {})
```

Se dois posts tiverem exatamente o mesmo `createdAt` (possível em batch operations ou alta concorrência), um deles será pulado na paginação.

**Fix:** Usar cursor baseado no `id` do post (CUIDs são ordenáveis por tempo):

```ts
...(cursor ? { id: { lt: cursor } } : {})
// E mudar orderBy para usar id também:
orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
```

Ou usar o pattern Prisma nativo de cursor:

```ts
...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
orderBy: { createdAt: 'desc' },
```

---

### 2.6 Type safety perdida em `updateUserBook`

**Arquivo:** `src/lib/actions/book.ts` (linha 140)

**Problema:**

```ts
const updates: Record<string, unknown> = { ...validated }
delete updates.userBookId
```

Você validou com Zod (type-safe) e imediatamente jogou fora a tipagem ao converter pra `Record<string, unknown>`.

**Fix:**

```ts
const { userBookId, ...updates } = validated
```

Simples, mantém tipagem, e o TypeScript infere o tipo de `updates` automaticamente.

---

## 3. Bugs

### 3.1 `pagesRead` usa `currentPage` em vez de `pageCount`

**Arquivo:** `src/lib/services/gamification.ts` (linhas 107-109)

**Problema:**

```ts
pagesRead: db.userBook.aggregate({
  where: { userId, status: 'READ' },
  _sum: { currentPage: true },
}),
```

`currentPage` é a posição atual de leitura do usuário, que pode ser qualquer valor (ou null se nunca foi atualizado). Para livros com status READ, o total de páginas lidas deveria ser `book.pageCount`.

**Fix:**

```ts
// Buscar pageCount dos livros lidos
const readBooks = await db.userBook.findMany({
  where: { userId, status: 'READ' },
  select: { book: { select: { pageCount: true } } },
})
const pagesRead = readBooks.reduce((sum, ub) => sum + (ub.book.pageCount || 0), 0)
```

Ou com raw query para ser mais eficiente:

```ts
const result = await db.$queryRaw<[{ total: bigint }]>`
  SELECT COALESCE(SUM(b.page_count), 0) as total
  FROM user_book ub
  JOIN book b ON ub.book_id = b.id
  WHERE ub.user_id = ${userId} AND ub.status = 'READ'
`
const pagesRead = Number(result[0].total)
```

---

### 3.2 `getWeekNumber` é frágil

**Arquivo:** `src/lib/services/gamification.ts` (linhas 165-169)

**Problema:**

```ts
function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - startOfYear.getTime()
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000))
}
```

- Não considera timezone (Dates podem estar em UTC vs local)
- Dois livros terminados na mesma semana em anos diferentes teriam o mesmo weekNumber, quebrando a lógica de streak
- Não segue o padrão ISO de semanas

**Fix:** Usar `date-fns` que já é dependência do projeto:

```ts
import { getISOWeek, getISOWeekYear } from 'date-fns'

// Na lógica do streak, usar weekYear + week para identificar uniquamente:
const weekKey = `${getISOWeekYear(book.finishDate)}-W${getISOWeek(book.finishDate)}`
```

---

### 3.3 Synopsis renderizada como texto mas pode conter HTML

**Arquivo:** `src/app/(main)/book/[id]/page.tsx` (linhas 268-269)

**Problema:**

```tsx
<p className="... whitespace-pre-line">{book.synopsis}</p>
```

A Google Books API retorna `description` com tags HTML (`<p>`, `<b>`, `<br>`, `<i>`). Renderizar como texto puro mostra as tags literais para o usuário.

**Fix — Opção A (sanitizar e renderizar como HTML):**

```bash
pnpm add sanitize-html
pnpm add -D @types/sanitize-html
```

```tsx
import sanitizeHtml from 'sanitize-html'

const cleanSynopsis = sanitizeHtml(book.synopsis, {
  allowedTags: ['b', 'i', 'em', 'strong', 'br', 'p'],
  allowedAttributes: {},
})

<div
  className="... leading-relaxed"
  dangerouslySetInnerHTML={{ __html: cleanSynopsis }}
/>
```

**Fix — Opção B (strip all HTML ao salvar):**

No `addBookToShelf`, limpar antes de salvar:

```ts
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

// No create do Book:
synopsis: validated.synopsis ? stripHtml(validated.synopsis) : undefined,
```

Opção B é mais simples e evita lidar com HTML no frontend.

---

## 4. Melhorias de Qualidade

### 4.1 Stats duplicadas na shelf page

**Arquivo:** `src/app/(main)/shelf/page.tsx` (linhas 29-35)

**Problema:** A shelf page computa stats inline (total, reading, read, wantToRead, abandoned) enquanto `services/stats.ts` tem `getUserReadingStats` que faz a mesma coisa.

**Fix:** Usar o service existente:

```ts
import { getUserReadingStats } from '@/lib/services/stats'

const stats = await getUserReadingStats(session.user.id)
```

Note: o service retorna mais dados do que a página precisa, mas isso é ok — as queries extras são baratas se forem refatoradas para usar aggregates (item 2.3). Se preferir, pode criar uma função `getShelfStats` mais enxuta no service.

---

### 4.2 Queries sequenciais na book page

**Arquivo:** `src/app/(main)/book/[id]/page.tsx` (linhas 57-97)

**Problema:** Três queries executadas em sequência (`book`, `user`, `userBook`) quando poderiam rodar em paralelo.

**Fix:**

```ts
const [book, user] = await Promise.all([
  db.book.findUnique({ where: { id } }),
  session?.user?.id
    ? db.user.findUnique({
        where: { id: session.user.id },
        select: { username: true },
      })
    : null,
])

if (!book) notFound()

// userBook depende de book existir e session, mas não de user
const userBook = session?.user?.id
  ? await db.userBook.findFirst({ ... })
  : null
```

Na verdade `userBook` não depende do resultado de `book` (só do `id` da URL, que já temos), então pode entrar no Promise.all também:

```ts
const [book, user, userBook] = await Promise.all([
  db.book.findUnique({ where: { id } }),
  session?.user?.id
    ? db.user.findUnique({ where: { id: session.user.id }, select: { username: true } })
    : null,
  session?.user?.id
    ? db.userBook.findFirst({ where: { userId: session.user.id, bookId: id, isReread: false }, include: { ... } })
    : null,
])
```

---

### 4.3 Error boundaries por segmento de rota

**Problema:** Só existe um `error.tsx` na raiz. Se a página de stats falhar (ex: query pesada dá timeout), o app inteiro mostra o error boundary.

**Fix:** Criar `error.tsx` nos segmentos mais críticos:

```
src/app/(main)/shelf/error.tsx
src/app/(main)/stats/error.tsx
src/app/(main)/feed/error.tsx
src/app/(main)/book/[id]/error.tsx
```

Cada um com mensagem contextual ("Erro ao carregar sua estante", "Erro ao carregar estatísticas", etc.) e botão de retry.

---

### 4.4 XSS via conteúdo de usuário armazenado

**Problema:** Campos como `bio`, `quote`, `comment.content`, `annotation.content` são inseridos pelo usuário e renderizados no app. Se algum componente usar `dangerouslySetInnerHTML` no futuro (ou se o React tiver um bypass), há risco de XSS.

**Fix preventivo:** Sanitizar na entrada (nos server actions) em vez de confiar só na renderização do React:

```ts
// src/lib/utils.ts
export function sanitizeText(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}
```

Aplicar no `submitComment`, `createAnnotation`, `updateProfile`, `shareQuote`.

Nota: o React já escapa por padrão ao renderizar strings em JSX, então isso é defesa em profundidade.

---

### 4.5 Observabilidade de erros

**Problema:** Todos os errors são tratados com `console.error`, que desaparece nos logs serverless da Vercel e não dá contexto (qual usuário, qual input).

**Fix (mínimo viável):**

```ts
// src/lib/logger.ts
export function logError(context: string, error: unknown, meta?: Record<string, unknown>) {
  console.error(JSON.stringify({
    context,
    error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    ...meta,
    timestamp: new Date().toISOString(),
  }))
}
```

Usar nos actions:

```ts
catch (error) {
  logError('addBookToShelf', error, { userId: user.id, bookTitle: validated.title })
  return { success: false, error: 'Erro ao adicionar livro' }
}
```

**Fix (futuro):** Integrar Sentry (`@sentry/nextjs`) para alertas, grouping, e stack traces com source maps.

---

## 5. Testes

### 5.1 Onde começar

O projeto não tem testes. Priorizar testes nos services (lógica pura, fácil de mockar o Prisma):

1. **`services/gamification.ts`** — Lógica mais complexa, mais risco de regressão
2. **`services/stats.ts`** — Agregações que podem quebrar silenciosamente
3. **`services/feed.ts`** — Paginação e permissões
4. **`validators/book.ts`** — Schemas Zod, testar edge cases de rating, URLs

Setup mínimo:

```bash
pnpm add -D vitest @vitest/coverage-v8
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Mockar o Prisma client:

```ts
// src/__tests__/helpers/db-mock.ts
import { vi } from 'vitest'

export const mockDb = {
  user: { findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
  userBook: { findMany: vi.fn(), count: vi.fn(), aggregate: vi.fn(), groupBy: vi.fn() },
  achievement: { findMany: vi.fn() },
  userAchievement: { findUnique: vi.fn(), upsert: vi.fn() },
  pointsLog: { create: vi.fn() },
  $transaction: vi.fn(),
}

vi.mock('@/lib/db', () => ({ db: mockDb }))
```

---

## Ordem sugerida de execução

| # | Item | Esforço | Impacto |
|---|------|---------|---------|
| 1 | 1.1 Race condition spendCoins | 5 min | Crítico |
| 2 | 2.2 Remover dynamic imports | 2 min | Limpeza |
| 3 | 2.6 Fix type safety updateUserBook | 2 min | Limpeza |
| 4 | 3.1 Fix pagesRead bug | 10 min | Bug real |
| 5 | 3.2 Fix getWeekNumber | 5 min | Bug real |
| 6 | 2.1 Unificar padrão de auth | 15 min | Consistência |
| 7 | 2.4 Adicionar indexes | 10 min | Performance |
| 8 | 2.5 Fix cursor do feed | 10 min | Corretude |
| 9 | 3.3 Fix synopsis HTML | 15 min | Bug visual |
| 10 | 4.1 Remover stats duplicadas | 5 min | Limpeza |
| 11 | 4.2 Paralelizar queries book page | 10 min | Performance |
| 12 | 1.2 Otimizar checkAchievements | 45 min | Performance |
| 13 | 2.3 Stats no banco em vez de memória | 30 min | Performance |
| 14 | 4.5 Logger estruturado | 15 min | Observabilidade |
| 15 | 4.4 Sanitizar input de usuário | 20 min | Segurança |
| 16 | 4.3 Error boundaries por rota | 20 min | UX |
| 17 | 5.1 Setup de testes + primeiros testes | 1-2h | Qualidade |
| 18 | 1.3 Rate limiting | 30 min | Segurança |
