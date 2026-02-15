# LerTraça

<p align="center">
  <strong>Sua estante virtual e rede social de leitura</strong>
</p>

<p align="center">
  LerTraça é uma plataforma brasileira para leitores organizarem seus livros, acompanharem estatísticas de leitura e se conectarem com outros leitores.
</p>

---

## Funcionalidades

### Biblioteca Pessoal
- Busca de livros via Google Books e Open Library
- Organização por status: Quero Ler, Lendo, Lido, Abandonado
- Avaliação com meias-estrelas (0.5 a 5)
- Anotações e citações por livro
- Marcação de releituras
- Tags personalizadas

### Estante Visual
- Visualização em lombadas com cores extraídas das capas
- Drag & drop para reordenar
- Animação de abertura de livro
- 6 temas de prateleira

### Social
- Perfis públicos
- Sistema de seguidores
- Feed de atividades
- Curtidas e comentários
- Compartilhamento de citações

### Estatísticas
- Dashboard com gráficos de leitura
- Calendário de atividades (heatmap)
- Metas de leitura anuais
- Retrospectiva anual (LerTraça Wrapped)

### Gamificação
- Sistema de pontos e moedas
- 19 conquistas desbloqueáveis
- Badges no perfil
- Leaderboard

### Share Cards
- Geração de cards visuais ao terminar livros
- Formatos para Stories e Feed
- Cores baseadas na capa do livro

---

## Tech Stack

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

## Desenvolvimento

### Pré-requisitos

- Node.js 20+
- pnpm 8+
- PostgreSQL (ou conta no Neon)

### Setup

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/lertraca.git
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

### Scripts disponíveis

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

## Estrutura do Projeto

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

## Convenções

### Código
- TypeScript strict mode sempre
- Componentes Server por padrão
- `"use client"` apenas quando necessário
- Validação com Zod antes de tocar no banco

### Nomenclatura
- Arquivos: `kebab-case` (ex: `book-detail.tsx`)
- Componentes: `PascalCase` (ex: `BookCard`)
- Hooks: prefixo `use` (ex: `useBookSearch`)

### Git
- Commits em português
- Formato: `feat: adiciona busca de livros`, `fix: corrige filtro`
- Branches: `feat/nome`, `fix/descricao`, `chore/tarefa`

---

## API de Livros

O LerTraça usa duas APIs para buscar informações de livros:

1. **Google Books API** (principal)
   - Melhores capas para livros brasileiros
   - Limite: 1000 req/dia sem key

2. **Open Library API** (fallback)
   - Sem limites rígidos
   - Usado quando Google Books não retorna resultado

Ao adicionar um livro, os dados são salvos localmente na tabela `Book` para cache.

---

## Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feat/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feat/nova-feature`)
5. Abra um Pull Request

---

## Licença

Este projeto é privado e não está licenciado para uso público.

---

## Autores

- **Ket** - Desenvolvimento

---

<p align="center">
  Feito com 📚 no Brasil
</p>
