# Roadmap — LerTraça

## Fase 0: Setup & Infraestrutura (1 semana) ✅

> Objetivo: projeto rodando localmente com banco, auth, e deploy funcionando.

- [x] Inicializar projeto Next.js 15 com App Router + TypeScript strict
- [x] Configurar Tailwind CSS 4
- [x] Configurar ESLint + Prettier
- [x] Configurar Prisma com PostgreSQL (Neon)
- [x] Criar schema inicial do banco (User, Book, UserBook)
- [x] Configurar NextAuth.js v5 (registro com email/senha + Google OAuth)
- [ ] Deploy inicial no Vercel (CI/CD automático via GitHub)
- [ ] Criar seed básico com dados de teste
- [x] Configurar variáveis de ambiente (.env.example documentado)

**Entregável:** App rodando em produção com login funcionando e banco conectado.

---

## Fase 1: Livros & Estante — MVP (4-5 semanas) ✅

> Objetivo: o usuário consegue buscar livros, adicioná-los à estante, gerenciar sua biblioteca, importar do Goodreads, e exportar seus dados.

### 1a. Busca e cadastro de livros

- [x] Integração Google Books API (busca por título, autor, ISBN)
- [x] Integração Open Library API (fallback)
- [x] Tela de busca com autocomplete/debounce
- [x] Ao adicionar: salvar dados canônicos na tabela `Book` (cache local)
- [x] Extrair cor dominante da capa via `node-vibrant` ao cadastrar (salvar `color_primary`, `color_secondary`)
- [x] Criar relação `UserBook` com status inicial (quero ler / lendo / lido / abandonado)

### 1b. Página do livro

- [x] Exibir capa, título, subtítulo, sinopse, autor, editora, páginas, ISBN, categoria
- [x] Campos editáveis pelo usuário: data de aquisição, valor, tags
- [x] **Rating 0.5-5 estrelas** com incrementos de meia-estrela (componente visual: clicar metade esquerda/direita)
- [x] Status de leitura com seletor visual
- [x] **Marcar releitura:** botão "Ler de novo" que cria novo UserBook vinculado ao original
- [x] Histórico de leituras (se houver releituras) com datas e ratings de cada uma
- [x] Seção de anotações (criar, editar, deletar)
- [x] Seção de citações (criar, editar, deletar)

### 1c. Estante / Biblioteca

- [x] Visualização em lista (mais simples, implementar primeiro)
- [x] Filtros: por autor, editora, categoria, valor, status de leitura, tag
- [x] Contador de livros e porcentagem por status
- [x] Ordenação: por título, autor, data de adição, rating
- [x] Busca dentro da própria estante
- [x] Indicador visual de releitura (badge "2ª leitura" etc.)

### 1d. Importação & Exportação ⏸️ (ADIADO - fazer após Fase 2)

- [ ] **Importação Goodreads:** upload de CSV → parse com PapaParse → match via Google Books API por ISBN → criar Book + UserBook
- [ ] Mapeamento de shelves: read→READ, currently-reading→READING, to-read→WANT_TO_READ
- [ ] Barra de progresso durante importação + revisar conflitos
- [ ] Processamento em batch server-side para CSVs grandes
- [ ] **Exportação:** gerar CSV compatível com Goodreads (todos os dados do UserBook + Book + anotações)
- [ ] Botão de exportação acessível nas configurações do perfil

**Entregável:** Usuário consegue buscar livros, adicionar à estante, avaliar com meia-estrela, anotar, marcar releitura, importar do Goodreads e exportar dados.

---

## Fase 2: Perfil, Estante Visual, Animações & Share Card (4-5 semanas) ✅

> Objetivo: o perfil fica bonito, a estante ganha a identidade visual do LerTraça com interações memoráveis.

### 2a. Perfil do usuário

- [x] Página pública: `/profile/[username]`
- [x] Exibir: avatar, nome, username, bio, citação
- [x] Links de redes sociais (Instagram, Reddit, TikTok)
- [x] Campo de música (link ou embed — definir escopo)
- [x] Edição de perfil (settings)

### 2b. Estante visual

- [x] Renderizar livros como "lombadas" na prateleira (inspiração: wireframes)
- [x] Cores das lombadas baseadas na capa do livro (usar `color_primary` extraída)
- [x] Scroll vertical para múltiplas prateleiras
- [x] Responsivo: adaptar quantidade de livros por prateleira

### 2c. Animações & Interações

- [x] **Drag & drop:** Reordenar livros na estante com `Reorder` do Framer Motion
- [x] Persistir ordem customizada no banco (`shelf_position`) via Server Action com debounce
- [ ] Long press no mobile para ativar modo de reordenação
- [x] **Book open animation:** Clicar na lombada → livro "abre" e se transforma no modal
- [x] Implementar com `layoutId` do Framer Motion (shared layout animation)
- [x] Efeito 3D de abertura com `perspective` + `rotateY`
- [x] Modal linkável via URL state (`?book=id`) + funcionar com browser back
- [ ] Adaptação mobile: modal full-screen com scale-up vertical
- [x] Fade in staggered do conteúdo interno do modal
- [x] **Micro-interações:** hover na lombada (destaque com translateZ), animação de adicionar/remover livro
- [x] Respeitar `prefers-reduced-motion` em todas as animações

### 2d. Temas

- [x] Tema padrão (estante de madeira clara)
- [x] 4-6 temas iniciais (madeira escura, metal/industrial, minimalista branco, rosa/floral, fantasia)
- [x] Selector de tema nas configurações do perfil
- [ ] Personalização de fundo (upload de imagem ou escolha de padrão)
- [x] **Modo escuro:** implementar com Tailwind `dark:` classes + `next-themes` para toggle e persistência
- [x] Definir tokens de cor com CSS variables para light/dark desde o início
- [x] Estrutura extensível para adicionar temas via gamificação no futuro

### 2e. Share Card (compartilhamento de livro finalizado)

- [x] Extração de cor dominante da capa via `node-vibrant` (ao cadastrar livro, salvar no banco)
- [x] Geração de card visual com `@vercel/og` (Satori) — fundo gradiente com cores do livro, capa centralizada
- [x] Dois formatos: 1080x1920 (stories) e 1080x1080 (feed)
- [x] Modal de "parabéns" ao marcar livro como lido → preview do card → download/compartilhar
- [x] Integração com Web Share API (mobile) + botão de download (desktop)
- [x] Usar cores extraídas também nas lombadas da estante visual

**Entregável:** Perfis públicos bonitos com estante visual temática, share cards virais ao terminar livros, e tudo compartilhável.

---

## Fase 3: Estatísticas & Retrospectiva (3-4 semanas) ✅

> Objetivo: dashboard de leitura com dados visuais, insights, e retrospectiva anual estilo Spotify Wrapped.

- [x] Tracking de páginas lidas por dia (ReadingLog)
- [x] Calendário de leitura (heatmap estilo GitHub contributions)
- [x] Gráfico pizza: livros lidos vs não lidos vs abandonados
- [x] Gráfico pizza/bar: distribuição por autor e por editora
- [x] Gráfico de barras: páginas lidas por dia/semana/mês
- [ ] Gráfico de linha: valor gasto em livros ao longo do tempo (futuro)
- [x] Meta de leitura anual (ex: "quero ler 24 livros em 2026")
- [x] Widget resumo: total de livros, páginas lidas, tempo estimado de leitura
- [x] **Meta de leitura anual:** definir "quero ler X livros em [ano]", barra de progresso, widget no perfil
- [x] Contabilizar releituras nas stats (páginas, tempo, contagem)

### Retrospectiva Anual (LerTraça Wrapped)

- [x] Rota dedicada: `/retrospective/[year]`
- [x] Aggregar dados do ano: livros lidos, páginas, autores/editoras/categorias top, streak, mês mais produtivo, valor gasto, rating médio
- [x] Sequência de slides/stories navegáveis (swipe ou clique)
- [x] Animações de transição com Framer Motion
- [ ] Cada slide exportável como imagem (reutilizar lógica do share card) — TODO: futuramente
- [x] Comparação com ano anterior (se houver dados)
- [x] Disponível a partir de 1º de dezembro; anos anteriores acessíveis no perfil
- [ ] Cache dos dados de anos fechados (ISR ou JSON no banco) — TODO: otimização futura

**Biblioteca de gráficos sugerida:** Recharts (leve, React-native, boa DX com TS).

**Entregável:** Dashboard completo com todas as visualizações + retrospectiva anual compartilhável.

---

## Fase 4: Social (3-4 semanas) ✅

> Objetivo: transformar o app em rede social de leitura.

### 4a. Sistema de follows

- [x] Seguir / deixar de seguir usuários
- [x] Lista de seguidores e seguindo
- [ ] Status de atividade (online, lendo, offline) — avaliar viabilidade (baixa prioridade)
- [x] Busca de usuários por nome ou username

### 4b. Feed

- [x] Gerar posts automáticos: começou a ler, terminou, abandonou, avaliou
- [x] Posts manuais: compartilhar citação, recomendação
- [x] Feed do usuário (próprio) e feed geral (quem segue)
- [x] Paginação infinita (cursor-based)

### 4c. Interações

- [x] Curtir posts do feed
- [x] Comentar em posts
- [ ] Compartilhar livro/perfil (gerar link ou card para redes sociais) — futuro
- [x] Notificações básicas (novo seguidor, comentário, curtida) — modelo criado, UI pendente

**Entregável:** Rede social funcional com feed, interações e descoberta de leitores.

---

## Fase 5: Gamificação (2-3 semanas) ✅

> Objetivo: engajamento via recompensas e progressão.

- [x] Sistema de pontos: ganhar pontos por ações (adicionar livro, completar leitura, preencher metadados, avaliar, etc.)
- [x] Moeda interna convertida de pontos
- [x] Conquistas/achievements (ex: "Leitor de 100 páginas por dia", "Maratonista: 5 livros em 1 mês")
- [ ] Temas desbloqueáveis por pontos/conquistas — estrutura pronta, UI pendente
- [x] Badges no perfil
- [x] Leaderboard (opcional — semanal/mensal por livros lidos, páginas, etc.)

**Entregável:** Sistema de recompensas que incentiva uso recorrente e preenchimento de dados.

---

## Fase 6: Polish & Preparação Mobile (2+ semanas)

> Objetivo: refinar a experiência e preparar pra escalar.

- [x] Performance: otimizar queries, lazy loading de imagens, ISR para perfis
- [x] SEO: meta tags, Open Graph, structured data (Schema.org Book)
- [x] Acessibilidade: skip-to-content, focus trap, semantic HTML, navegação por teclado
- [x] PWA: manifest, service worker, offline básico
- [ ] Testes: cobertura mínima para fluxos críticos (auth, adicionar livro, feed)
- [ ] Rate limiting e proteção contra abuse
- [ ] Monitoramento: error tracking (Sentry), analytics básico
- [ ] Documentação: README, guia de contribuição, API docs

**Entregável:** App pronto para beta público e base sólida para versão mobile.

---

## Fase 7: Features Avançadas (ongoing)

> Objetivo: escalar o produto com features de alto valor que requerem mais complexidade.

### 7a. Scanner de ISBN

- [ ] Escanear código de barras via câmera do celular
- [ ] Usar `html5-qrcode` (funciona no browser, sem app nativo)
- [ ] Fluxo: scan → extrair ISBN → buscar via Google Books API → adicionar à estante
- [ ] Priorizar quando houver foco mobile (PWA)

### 7b. Clubes de Leitura

- [ ] Modelo de dados: Club, ClubMembership, ClubBook, Discussion
- [ ] Criar clube, convidar membros, definir livro do mês
- [ ] Discussão por capítulo/seção (thread-based)
- [ ] Feed do clube separado do feed geral

### 7c. Sistema de Recomendações

- [ ] V1 simples: "quem leu X também leu Y" (collaborative filtering básico via query SQL)
- [ ] V2: considerar ratings, categorias, e autores em comum
- [ ] Seção "Descobrir" no app com recomendações personalizadas

### 7d. Integração Kindle

- [ ] Importar highlights via upload de "My Clippings.txt"
- [ ] Parsear o formato do Kindle (título, highlight, localização, data)
- [ ] Vincular highlights às citações do livro no LerTraça
- [ ] Investigar integração com Readwise como alternativa

**Entregável:** Features de escala que diferenciam o LerTraça como plataforma completa.

---

## Estimativa Total

| Fase                                       | Duração estimada   |
| ------------------------------------------ | ------------------ |
| 0 — Setup                                  | 1 semana           |
| 1 — Livros, Estante & Import/Export (MVP)  | 4-5 semanas        |
| 2 — Perfil, Visual, Animações & Share Card | 4-5 semanas        |
| 3 — Estatísticas, Metas & Retrospectiva    | 3-4 semanas        |
| 4 — Social                                 | 3-4 semanas        |
| 5 — Gamificação                            | 2-3 semanas        |
| 6 — Polish                                 | 2+ semanas         |
| 7 — Features Avançadas                     | ongoing            |
| **Total (até beta público)**               | **~19-24 semanas** |

> Essas estimativas assumem dois devs trabalhando part-time. Ajustar conforme disponibilidade real.
> Fase 7 é contínua e não tem deadline — features são adicionadas conforme prioridade e feedback dos usuários.
