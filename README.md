# LerTraça

<p align="center">
  <strong>Your virtual bookshelf and reading social network</strong>
</p>

<p align="center">
  LerTraça is a Brazilian platform for readers to organize their books, track reading stats, and connect with other readers.
</p>

<p align="center">
  <a href="#english">English</a> | <a href="#português">Português</a>
</p>

---

## <a id="english"></a> English

### Features

#### Personal Library
- Book search via Google Books and Open Library
- Status tracking: Want to Read, Reading, Read, Abandoned
- Half-star ratings (0.5 to 5)
- Notes and quotes per book
- Re-read tracking
- Custom tags

#### Visual Bookshelf
- Spine view with colors extracted from covers
- Drag & drop reordering
- Book opening animation
- 6 shelf themes

#### Social
- Public profiles
- Follower system
- Activity feed
- Likes and comments
- Quote sharing

#### Statistics
- Reading dashboard with charts
- Activity calendar (heatmap)
- Yearly reading goals
- Annual retrospective (LerTraça Wrapped)

#### Gamification
- Points and coins system
- 19 unlockable achievements
- Profile badges
- Leaderboard

#### Share Cards
- Visual card generation when finishing books
- Stories and Feed formats
- Colors based on book cover

---

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Authentication | NextAuth.js v5 |
| Hosting | Vercel |
| Animations | Framer Motion |
| Charts | Recharts |
| Validation | Zod |

---

### Development

#### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL (or a Neon account)

#### Setup

1. Clone the repository:
```bash
git clone https://github.com/Kettss1/lertraca.git
cd lertraca
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in the variables:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_BOOKS_API_KEY="..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Set up the database:
```bash
pnpm db:push
pnpm db:seed
```

5. Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

#### Available Scripts

```bash
pnpm dev          # Development server
pnpm build        # Production build
pnpm start        # Start production
pnpm lint         # Run linting
pnpm format       # Format code

# Database
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Prisma Studio
pnpm db:seed      # Seed database with initial data
```

---

### Project Structure

```
src/
├── app/                    # Next.js routes (App Router)
│   ├── (auth)/             # Login, register
│   ├── (main)/             # Authenticated pages
│   │   ├── shelf/          # Bookshelf
│   │   ├── book/[id]/      # Book details
│   │   ├── feed/           # Social feed
│   │   ├── stats/          # Statistics
│   │   └── achievements/   # Achievements
│   ├── profile/[username]/ # Public profile
│   └── retrospective/      # Annual retrospective
├── components/
│   ├── ui/                 # Base components
│   ├── book/               # Book components
│   ├── shelf/              # Shelf components
│   ├── social/             # Feed, comments, follow
│   ├── stats/              # Charts and widgets
│   └── gamification/       # Achievements, badges
├── lib/
│   ├── actions/            # Server Actions
│   ├── services/           # Business logic
│   ├── api/                # External integrations
│   └── validators/         # Zod schemas
├── hooks/                  # Custom React hooks
└── types/                  # TypeScript types
```

---

### Conventions

#### Code
- TypeScript strict mode always
- Server Components by default
- `"use client"` only when necessary
- Zod validation before any database operation

#### Naming
- Files: `kebab-case` (e.g., `book-detail.tsx`)
- Components: `PascalCase` (e.g., `BookCard`)
- Hooks: `use` prefix (e.g., `useBookSearch`)

#### Git
- Commits in Portuguese
- Format: `feat: adiciona busca de livros`, `fix: corrige filtro`
- Branches: `feat/name`, `fix/description`, `chore/task`

---

### Book APIs

LerTraça uses two APIs to fetch book information:

1. **Google Books API** (primary)
   - Better covers for Brazilian books
   - Limit: 1,000 req/day without key

2. **Open Library API** (fallback)
   - No hard limits
   - Used when Google Books returns no results

When adding a book, data is saved locally in the `Book` table for caching.

---

### Contributing

1. Fork the project
2. Create a branch (`git checkout -b feat/new-feature`)
3. Commit your changes (`git commit -m 'feat: adds new feature'`)
4. Push to the branch (`git push origin feat/new-feature`)
5. Open a Pull Request

---

### License

This project is private and not licensed for public use.

---

### Authors

- **Ket** - Development

---

## <a id="português"></a> Português

<p align="center">
  <strong>Sua estante virtual e rede social de leitura</strong>
</p>

<p align="center">
  LerTraça é uma plataforma brasileira para leitores organizarem seus livros, acompanharem estatísticas de leitura e se conectarem com outros leitores.
</p>

---

### Funcionalidades

#### Biblioteca Pessoal
- Busca de livros via Google Books e Open Library
- Organização por status: Quero Ler, Lendo, Lido, Abandonado
- Avaliação com meias-estrelas (0.5 a 5)
- Anotações e citações por livro
- Marcação de releituras
- Tags personalizadas

#### Estante Visual
- Visualização em lombadas com cores extraídas das capas
- Drag & drop para reordenar
- Animação de abertura de livro
- 6 temas de prateleira

#### Social
- Perfis públicos
- Sistema de seguidores
- Feed de atividades
- Curtidas e comentários
- Compartilhamento de citações

#### Estatísticas
- Dashboard com gráficos de leitura
- Calendário de atividades (heatmap)
- Metas de leitura anuais
- Retrospectiva anual (LerTraça Wrapped)

#### Gamificação
- Sistema de pontos e moedas
- 19 conquistas desbloqueáveis
- Badges no perfil
- Leaderboard

#### Share Cards
- Geração de cards visuais ao terminar livros
- Formatos para Stories e Feed
- Cores baseadas na capa do livro

---

### Tech Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript (strict mode) |
| Estilização | Tailwind CSS 4 |
| Banco de Dados | PostgreSQL (Neon) |
| ORM | Prisma |
| Autenticação | NextAuth.js v5 |
| Hospedagem | Vercel |
| Animações | Framer Motion |
| Gráficos | Recharts |
| Validação | Zod |

---

### Desenvolvimento

#### Pré-requisitos

- Node.js 20+
- pnpm 8+
- PostgreSQL (ou conta no Neon)

#### Setup

1. Clone o repositório:
```bash
git clone https://github.com/Kettss1/lertraca.git
cd lertraca
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Preencha as variáveis:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-aqui"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_BOOKS_API_KEY="..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Configure o banco de dados:
```bash
pnpm db:push
pnpm db:seed
```

5. Inicie o servidor de desenvolvimento:
```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000).

#### Scripts disponíveis

```bash
pnpm dev          # Servidor de desenvolvimento
pnpm build        # Build de produção
pnpm start        # Iniciar produção
pnpm lint         # Verificar linting
pnpm format       # Formatar código

# Banco de dados
pnpm db:generate  # Gerar cliente Prisma
pnpm db:push      # Push do schema
pnpm db:migrate   # Executar migrações
pnpm db:studio    # Abrir Prisma Studio
pnpm db:seed      # Popular banco com dados iniciais
```

---

### Estrutura do Projeto

```
src/
├── app/                    # Rotas Next.js (App Router)
│   ├── (auth)/             # Login, registro
│   ├── (main)/             # Páginas autenticadas
│   │   ├── shelf/          # Estante
│   │   ├── book/[id]/      # Detalhes do livro
│   │   ├── feed/           # Feed social
│   │   ├── stats/          # Estatísticas
│   │   └── achievements/   # Conquistas
│   ├── profile/[username]/ # Perfil público
│   └── retrospective/      # Retrospectiva anual
├── components/
│   ├── ui/                 # Componentes base
│   ├── book/               # Componentes de livro
│   ├── shelf/              # Componentes da estante
│   ├── social/             # Feed, comentários, follow
│   ├── stats/              # Gráficos e widgets
│   └── gamification/       # Conquistas, badges
├── lib/
│   ├── actions/            # Server Actions
│   ├── services/           # Lógica de negócio
│   ├── api/                # Integrações externas
│   └── validators/         # Schemas Zod
├── hooks/                  # React hooks customizados
└── types/                  # TypeScript types
```

---

### Convenções

#### Código
- TypeScript strict mode sempre
- Componentes Server por padrão
- `"use client"` apenas quando necessário
- Validação com Zod antes de tocar no banco

#### Nomenclatura
- Arquivos: `kebab-case` (ex: `book-detail.tsx`)
- Componentes: `PascalCase` (ex: `BookCard`)
- Hooks: prefixo `use` (ex: `useBookSearch`)

#### Git
- Commits em português
- Formato: `feat: adiciona busca de livros`, `fix: corrige filtro`
- Branches: `feat/nome`, `fix/descricao`, `chore/tarefa`

---

### API de Livros

O LerTraça usa duas APIs para buscar informações de livros:

1. **Google Books API** (principal)
   - Melhores capas para livros brasileiros
   - Limite: 1000 req/dia sem key

2. **Open Library API** (fallback)
   - Sem limites rígidos
   - Usado quando Google Books não retorna resultado

Ao adicionar um livro, os dados são salvos localmente na tabela `Book` para cache.

---

### Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feat/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feat/nova-feature`)
5. Abra um Pull Request

---

### Licença

Este projeto é privado e não está licenciado para uso público.

---

### Autores

- **Ket** - Desenvolvimento

---

<p align="center">
  Made with books in Brazil
</p>
