# CLAUDE.md — LerTraça

## Visão Geral

LerTraça é uma estante virtual e rede social de leitura voltada para o público brasileiro. O usuário cadastra seus livros, organiza em uma estante visual personalizável, acompanha estatísticas de leitura e interage com outros leitores.

O projeto é desenvolvido por dois devs (Ket e parceiro) como projeto independente.

---

## Tech Stack

| Camada         | Tecnologia                          | Justificativa                                                               |
| -------------- | ----------------------------------- | --------------------------------------------------------------------------- |
| Framework      | **Next.js 15 (App Router)**         | SSR/SSG, API routes, melhor SEO para perfis públicos                        |
| Linguagem      | **TypeScript** (strict mode)        | Sempre. Nunca JavaScript puro.                                              |
| Estilização    | **Tailwind CSS 4**                  | Produtividade + design system consistente                                   |
| Banco de Dados | **PostgreSQL (Neon)**               | Hospedagem serverless, integração nativa com Vercel                         |
| ORM            | **Prisma**                          | Type-safety com TS, migrations robustas, boa DX                             |
| Autenticação   | **NextAuth.js v5 (Auth.js)**        | Gratuito, flexível, suporta OAuth + credentials                             |
| Hospedagem     | **Vercel**                          | Deploy automático, edge functions, integração com Neon                      |
| APIs de Livros | **Google Books API + Open Library** | Google Books = capas BR melhores; Open Library = fallback gratuito          |
| Validação      | **Zod**                             | Schema validation integrada com TS e server actions                         |
| Animações      | **Framer Motion**                   | layoutId, Reorder, AnimatePresence — essencial para book open e drag & drop |
| State (client) | **Zustand** ou React Context        | Leve, sem boilerplate excessivo                                             |
| Testes         | **Vitest + Testing Library**        | Rápido, compatível com Vite/Next                                            |

---

## Convenções de Código

### Geral

- **SEMPRE TypeScript.** Nunca `any` — usar `unknown` e narrowing quando necessário.
- Strict mode habilitado no `tsconfig.json`.
- Usar `type` para tipos simples e `interface` para objetos/contratos de API.
- Nomear arquivos em **kebab-case**: `book-detail.tsx`, `use-book-search.ts`.
- Componentes React em **PascalCase**: `BookCard`, `ShelfView`.
- Hooks customizados sempre com prefixo `use`: `useBookSearch`, `useShelfFilters`.

### Estrutura de Pastas (App Router)

```
src/
├── app/                    # Rotas Next.js (App Router)
│   ├── (auth)/             # Grupo de rotas de autenticação
│   │   ├── login/
│   │   └── register/
│   ├── (main)/             # Grupo de rotas autenticadas
│   │   ├── shelf/          # Estante do usuário
│   │   ├── book/[id]/      # Página do livro
│   │   ├── stats/          # Dashboard de estatísticas
│   │   ├── search/         # Busca de livros
│   │   └── feed/           # Feed social
│   ├── profile/[username]/ # Perfil público (fora do grupo auth)
│   ├── layout.tsx
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # Componentes base reutilizáveis (Button, Input, Modal)
│   ├── book/               # Componentes de livro (BookCard, BookDetail, BookSearch)
│   ├── shelf/              # Componentes da estante (ShelfView, ShelfFilters, BookSpine)
│   ├── stats/              # Gráficos e widgets de estatísticas
│   ├── social/             # Feed, comments, follow button
│   └── layout/             # Header, Sidebar, Navigation
├── lib/
│   ├── db.ts               # Cliente Prisma (singleton)
│   ├── auth.ts             # Configuração NextAuth
│   ├── api/                # Funções de chamada a APIs externas
│   │   ├── google-books.ts
│   │   └── open-library.ts
│   ├── validators/         # Schemas Zod
│   └── utils.ts            # Helpers gerais
├── hooks/                  # Hooks customizados
├── types/                  # Tipos globais e DTOs
├── styles/                 # CSS global, Tailwind config
└── prisma/
    ├── schema.prisma
    └── migrations/
```

### Banco de Dados

- Nomes de tabelas em **snake_case** e no singular: `book`, `user`, `reading_status`.
- Usar `@map` no Prisma para manter snake_case no DB e camelCase no código.
- Sempre ter `created_at` e `updated_at` em todas as tabelas.
- UUIDs como IDs primários (`@default(cuid())`).
- Soft delete com campo `deleted_at` onde fizer sentido (ex: anotações).

### API & Server Actions

- Preferir **Server Actions** para mutações (criar livro, atualizar status).
- Usar **Route Handlers** (`app/api/`) apenas para webhooks ou integrações externas.
- Sempre validar input com Zod antes de tocar no banco.
- Retornar tipos consistentes: `{ success: true, data: T } | { success: false, error: string }`.

### Componentes

- Componentes Server por padrão. Adicionar `"use client"` apenas quando necessário.
- Props sempre tipadas com `interface` dedicada.
- Evitar prop drilling — usar composição e Context quando necessário.
- Componentes de UI base devem aceitar `className` para extensão via Tailwind.

### Git

- Commits em português, formato: `feat: adiciona busca de livros`, `fix: corrige filtro por autor`.
- Branches: `feat/nome-da-feature`, `fix/descricao-do-bug`, `chore/tarefa`.

---

## Modelo de Dados (Prisma - Visão Geral)

### Entidades Principais

```
User
├── id, email, password_hash, username (unique)
├── name, bio, avatar_url, quote, music_url
├── social_links (json): instagram, reddit, tiktok
├── theme_id (FK → Theme)
├── created_at, updated_at

Book (dados canônicos, compartilhados)
├── id, title, subtitle, synopsis
├── authors (string[]), publisher, published_date
├── page_count, isbn_10, isbn_13
├── cover_url, categories (string[])
├── color_primary, color_secondary (hex extraídas da capa)
├── google_books_id, open_library_key
├── created_at, updated_at

UserBook (relação user ↔ book, dados pessoais)
├── id, user_id (FK), book_id (FK)
├── status: WANT_TO_READ | READING | READ | ABANDONED
├── rating (0.5-5, incrementos de 0.5)
├── current_page
├── acquisition_date, acquisition_value
├── start_date, finish_date
├── shelf_position (Int — ordem customizada na estante)
├── is_reread (Boolean — se é releitura)
├── reread_of (FK → UserBook, nullable — referência à leitura original)
├── tags (string[])
├── created_at, updated_at

Annotation
├── id, user_book_id (FK)
├── type: NOTE | QUOTE
├── content, page_number
├── created_at, updated_at

ReadingLog (pra calcular páginas/dia)
├── id, user_book_id (FK)
├── date, pages_read
├── created_at

Follow
├── follower_id (FK → User)
├── following_id (FK → User)
├── created_at

FeedPost (atividade pública)
├── id, user_id (FK)
├── type: STARTED | FINISHED | ABANDONED | REVIEW | QUOTE_SHARED
├── user_book_id (FK, nullable)
├── content (nullable)
├── created_at

Comment
├── id, feed_post_id (FK), user_id (FK)
├── content
├── created_at, updated_at

Theme
├── id, name, shelf_style, background_url
├── is_default, unlock_condition (nullable)
├── created_at

ReadingGoal
├── id, user_id (FK)
├── year (Int)
├── target_books (Int)
├── created_at, updated_at
```

---

## APIs Externas

### Google Books API

- Endpoint: `https://www.googleapis.com/books/v1/volumes`
- Busca por título, autor, ISBN.
- Limite: 1000 req/dia (sem key), muito mais com API key.
- Retorna: capa (thumbnail → extraLarge), sinopse, metadados.

### Open Library API

- Endpoint: `https://openlibrary.org/search.json`
- Sem autenticação, sem limites rígidos.
- Usar como fallback quando Google Books não retornar resultado.
- Capas: `https://covers.openlibrary.org/b/isbn/{ISBN}-L.jpg`

### Estratégia de Busca

1. Buscar na Google Books API primeiro.
2. Se não encontrar ou faltar dados (sem capa, sem sinopse), complementar com Open Library.
3. Ao adicionar um livro à biblioteca, salvar os dados canônicos na tabela `Book` (cache local).
4. Nunca depender de chamada à API externa para renderizar a estante — sempre usar dados locais.

---

## Animações & Interações

O LerTraça aposta pesado em micro-interações e animações fluidas como diferencial de UX. Toda animação deve ser performática (GPU-accelerated), interruptível, e respeitar `prefers-reduced-motion`.

### Biblioteca principal: Framer Motion

Usar **Framer Motion** como engine de animação principal. Razões:

- `layoutId` permite animações de transição entre elementos (essencial para o book open).
- `AnimatePresence` para mount/unmount animado (modais, páginas).
- `Reorder` component nativo para drag-and-drop com animação.
- Integração natural com React e SSR (Next.js compatible).
- `useMotionValue` e `useTransform` para animações baseadas em gestos.

### Drag & Drop na Estante

O usuário pode arrastar livros na prateleira e reposicionar livremente.

**Stack técnica:**

- Usar `Reorder` do Framer Motion (não precisa de lib externa).
  - `<Reorder.Group>` = a prateleira.
  - `<Reorder.Item>` = cada livro/lombada.
- Salvar a ordem customizada no `UserBook` (campo `shelf_position: Int`).
- Persistir reordenação via Server Action com debounce (não salvar a cada pixel arrastado — salvar quando o usuário soltar o livro).
- Animação: os outros livros se deslocam suavemente para abrir espaço enquanto o livro é arrastado.
- **Fallback mobile:** Segurar (long press) para ativar modo de reordenação, similar ao iOS.
- Se no futuro precisar de drag entre prateleiras (ex: organizar por categorias), migrar para `@dnd-kit/core` que suporta múltiplos containers.

### Book Open Animation (Livro → Modal)

Ao clicar em um livro na estante, ele "abre" com animação e se transforma no modal de detalhes. O modal É o livro aberto.

**Conceito visual:**

1. **Estado fechado:** Lombada do livro na estante (retângulo fino, vertical, cor baseada na capa).
2. **Clique:** A lombada se expande, rotaciona sutilmente em perspectiva (como um livro abrindo pela capa).
3. **Estado aberto:** O livro aberto ocupa o centro da tela como um modal. O lado esquerdo é a capa do livro (imagem), o lado direito é o conteúdo (informações, anotações, citações, etc.).
4. **Fechar:** Animação reversa — o modal se comprime de volta na lombada e volta para a posição original na estante.

**Implementação técnica:**

```
Componentes envolvidos:
├── BookSpine (lombada na estante)
│   └── layoutId={`book-${book.id}`}   ← Framer Motion shared layout
├── BookModal (modal aberto)
│   └── layoutId={`book-${book.id}`}   ← MESMO layoutId = transição automática
└── AnimatePresence
    └── Wrapa o BookModal para animar mount/unmount
```

- **`layoutId`** do Framer Motion faz o trabalho pesado: conecta a lombada ao modal e anima a transição de posição, tamanho e forma automaticamente.
- **Perspectiva CSS:** Adicionar `perspective: 1200px` no container e `rotateY` na animação para o efeito 3D de "abrir o livro".
- **Fases da animação:**
  1. `rotateY: 0deg` → `rotateY: -15deg` (capa começa a abrir, ~200ms)
  2. Expand para tamanho do modal com `layoutId` transition (~400ms)
  3. Fade in do conteúdo interno (~200ms, staggered)
- **Performance:** Usar `will-change: transform` no BookSpine. Todas as propriedades animadas devem ser `transform` e `opacity` (GPU-only, sem layout thrashing).
- **Estado do modal:** Usar URL state (`?book=id`) para que o modal seja linkável e funcione com browser back button.
- **Mobile:** Em telas pequenas, o modal ocupa tela cheia (sheet bottom-up) com a capa no topo e conteúdo embaixo. A animação de abertura adapta para um scale-up vertical ao invés do efeito de livro abrindo.

### Outras Micro-interações

- **Hover na lombada:** Livro se "destaca" da prateleira (translateZ + sutil shadow).
- **Adicionar livro:** Animação de livro "entrando" na prateleira (slide in + squeeze dos vizinhos).
- **Remover livro:** Livro "cai" ou "sai" da prateleira, vizinhos fecham o espaço.
- **Trocar status:** Transição suave entre estados visuais (ex: badge "lendo" → "lido").
- **Feed:** Posts aparecem com stagger animation.
- **Retrospectiva:** Transições entre slides com Framer Motion variants.

### Regra de Ouro

Toda animação deve ter `duration` entre 200-500ms. Nada mais lento que 500ms (parece travado) e nada mais rápido que 150ms (imperceptível). Easing padrão: `[0.32, 0.72, 0, 1]` (custom ease-out, mais natural que `ease-in-out`).

Sempre respeitar:

```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

Se ativo, substituir animações por transições instantâneas (opacity fade simples).

---

### Share Card (Compartilhamento ao terminar um livro)

Quando o usuário marca um livro como "lido", pode gerar um card visual para compartilhar em redes sociais.

**Conceito:** Estilo Spotify — fundo com cor dominante extraída da capa do livro, capa centralizada, dados de leitura (título, autor, rating, tempo de leitura, etc.), e branding LerTraça.

**Stack técnica:**

- **Extração de cor dominante:** `node-vibrant` (server-side) ou `colorthief` (client-side).
  - Extrair na hora que o livro é adicionado ao banco e salvar as cores no model `Book` (campos `color_primary`, `color_secondary`).
  - Isso evita recalcular toda vez e permite usar as cores em outros contextos (lombada da estante, UI adaptativa).
- **Geração do card:**
  - **Opção A (recomendada): HTML/CSS → imagem via API route.** Usar `@vercel/og` (Satori) para gerar imagens OG dinâmicas. Funciona server-side no edge, retorna PNG. Ideal para share cards e Open Graph.
  - **Opção B: Client-side com `html-to-canvas`.** Mais flexível visualmente, mas depende do browser. Bom para preview em tempo real antes de baixar.
- **Formato de saída:** PNG 1080x1920 (stories) e 1080x1080 (feed). Usuário escolhe.
- **Fluxo UX:** Marcar como lido → modal de parabéns → preview do card → botão "Baixar imagem" + botão "Compartilhar" (Web Share API onde disponível).

### Retrospectiva Anual (LerTraça Wrapped)

Resumo visual do ano de leitura do usuário, inspirado no Spotify Wrapped. Disponibilizado no final de cada ano (ou sob demanda).

**Dados agregados:**

- Total de livros lidos, páginas lidas, tempo estimado de leitura
- Livro mais rápido e mais lento
- Autor mais lido, editora mais lida, categoria mais lida
- Maior sequência de dias lendo (streak)
- Mês mais produtivo
- Valor total gasto em livros
- Rating médio dado
- Citação favorita (mais compartilhada ou marcada)
- Comparação com o ano anterior (se houver dados)

**Stack técnica:**

- **Dados:** Query agregada no PostgreSQL via Prisma (`groupBy`, `aggregate`). Criar um service `reading-retrospective.ts` que monta o objeto de dados completo.
- **Apresentação:** Sequência de telas/slides estilo stories, navegáveis por swipe ou clique. Implementar como uma rota dedicada `/retrospective/[year]`.
- **Animações:** Framer Motion para transições entre slides.
- **Compartilhamento:** Cada slide pode ser exportado como imagem (mesma lógica do share card, via `@vercel/og` ou `html-to-canvas`).
- **Disponibilidade:** Gerar a partir de 1º de dezembro. Dados do ano corrente até a data atual. Anos anteriores disponíveis no perfil.
- **Cache:** Gerar os dados uma vez e cachear (ISR ou salvar no banco como JSON) — a retrospectiva de um ano fechado não muda.

---

## Importação & Exportação

### Importação do Goodreads (CSV)

Feature essencial para reduzir barreira de migração. Validada com comunidade leitora.

- Goodreads exporta CSV com colunas: Title, Author, ISBN, ISBN13, My Rating, Date Read, Date Added, Bookshelves, etc.
- **Fluxo:** Upload do CSV → parse com PapaParse → para cada livro: buscar na Google Books API por ISBN (ou título+autor como fallback) → criar `Book` se não existir → criar `UserBook` com status mapeado.
- **Mapeamento de shelves:** `read` → READ, `currently-reading` → READING, `to-read` → WANT_TO_READ.
- **Rating:** Goodreads usa 1-5 inteiros. Importar como está (sem meia-estrela, que é dado local).
- **UX:** Mostrar progresso da importação (barra + contador). Permitir revisar conflitos antes de confirmar.
- **Limite:** Processar em batch server-side (Server Action ou background job) para CSVs grandes (1000+ livros).

### Exportação de Dados

Diferencial vs Skoob (que não oferece exportação).

- Exportar para CSV compatível com Goodreads (facilita ida e volta).
- Incluir: todos os campos do UserBook + dados do Book + anotações + citações.
- Botão acessível nas configurações do perfil.
- Gerar arquivo server-side e retornar como download.

---

## Sistema de Avaliação

- Rating de **0.5 a 5 estrelas, com incrementos de 0.5** (diferencial vs Skoob que usa 1-5 inteiros).
- Componente visual: estrelas clicáveis. Clicar na metade esquerda = meia-estrela, metade direita = estrela cheia.
- Valor `0` = não avaliado (diferente de 0.5 que é a nota mais baixa possível).
- Armazenado como `Float` no banco.

---

## Releitura

Skoob não permite marcar releitura — frustração real da comunidade.

- O usuário pode marcar um livro como "releitura", o que cria um novo `UserBook` vinculado ao original via `reread_of`.
- Cada leitura tem suas próprias datas, rating, anotações e citações.
- Na estante, releituras aparecem como o mesmo livro com um badge/indicador visual (ex: "2ª leitura").
- Nas stats, releituras contam como leituras separadas (páginas, tempo, etc.).
- O histórico de todas as leituras é acessível na página do livro.

---

## Notas Importantes

- **Idioma do app:** Português brasileiro (pt-BR). Toda a interface é em português.
- **Idioma do código:** Inglês (variáveis, funções, componentes, commits podem ser em PT).
- **Gamificação:** Planejada para fase futura. Não implementar agora, mas o modelo de dados deve ser extensível (campo `points` no User, tabela `Achievement` pode ser adicionada depois).
- **Link de afiliado Amazon:** Não é prioridade. Ignorar por enquanto.
- **Modo escuro:** Obrigatório para o público leitor (leitura noturna). Implementar com Tailwind `dark:` classes. Usar `next-themes` para toggle e persistência. Planejar desde o início — definir tokens de cor com CSS variables para light e dark.
- **Scanner de ISBN:** Feature mobile — usar câmera do celular para escanear código de barras. Implementar quando houver foco mobile (PWA ou React Native). Lib sugerida: `html5-qrcode` (funciona em browser) ou `react-native-camera` (nativo).
- **Sistema de recomendações:** Feature complexa para fase futura. Pode começar simples (livros populares entre quem leu os mesmos livros que você — collaborative filtering básico) e evoluir.
- **Clubes de leitura:** Leitura coletiva com discussão. Feature social avançada — requer modelo de dados próprio (Club, ClubMembership, ClubBook, Discussion). Planejar após o social básico estar estável.
- **Integração Kindle:** Importar highlights/notas. Amazon não tem API oficial para isso — investigar soluções via export do Kindle (My Clippings.txt) ou serviços como Readwise.
- **Mobile:** O app será web-first. Manter o design responsivo desde o início para facilitar futura conversão para PWA ou React Native.
- **Acessibilidade:** Usar semantic HTML, aria labels, e garantir navegação por teclado.
- **SEO:** Perfis públicos e páginas de livros devem ter bons meta tags e Open Graph para compartilhamento em redes sociais.

---

## Comando Úteis

```bash
# Dev
npm run dev

# Banco
npx prisma migrate dev
npx prisma studio
npx prisma generate

# Testes
npm run test
npm run test:watch

# Lint & Format
npm run lint
npm run format
```
