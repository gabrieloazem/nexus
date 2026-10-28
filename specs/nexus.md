# 1. Sistema
- **Nome:** Nexus
- **Tecnologias:** HTML5, Tailwind CSS, JavaScript, Supabase
- **Favicon:** Ícone compatível com atalho do Android

# 2. Requisitos Técnicos
- **Arquitetura:** Sistema monolítico, com os módulos de Tarefas, Músicas, Finanças e Anotações integrados em uma única aplicação.
- **Responsividade:** Interface adaptável para smartphones e desktops.
- **Interface:** Suporte a tema Claro e Escuro (Light/Dark Mode) com persistência via `localStorage` e correção de alternância automática/manual.
- **Exclusão:** Toda exclusão deve ter um confirm antes.
- **Navegação:** A tela inicial deve permitir acesso aos módulos de Tarefas, Músicas, Finanças e Anotações.

# 3. Banco de Dados (Supabase)
- **URL:** https://supabase.com/dashboard/project/zdriboihloujzdjgtbmq/editor
- **ANON_KEY:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkcmlib2lobG91anpkamd0Ym1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDc0MDIsImV4cCI6MjA5NDA4MzQwMn0.GqD3hDxuytt9HSHfqF0S5PR0er01Hq9Z6VMZhU3InGc

## 3.1. Tabela: tarefas
- `id`: SERIAL Primary Key
- `data`: DATE
- `nome`: TEXT
- `finalizada`: BOOLEAN DEFAULT false
- `ordem`: INTEGER (ordem de exibição; executar a migração incluída no projeto)

## 3.2. Tabela: musicas
- `id`: SERIAL Primary Key
- `nome`: TEXT
- `favoritas`: BOOLEAN DEFAULT false
- `finalizada`: BOOLEAN DEFAULT false
- `conteudo`: TEXT
- `categorias`: TEXT
- `tonalidade`: TEXT

## 3.3. Tabela: financas
- `id`: SERIAL Primary Key
- `tipo`: TEXT (Entrada, Saída)
- `titulo`: TEXT
- `valor`: NUMERIC(12, 2)
- `data`: DATE
- `status`: TEXT (Pendente, Realizado)

## 3.4. Tabela: anotacoes
- `id`: SERIAL Primary Key
- `categoria`: TEXT
- `titulo`: TEXT
- `conteudo`: TEXT

# 4. Módulo da Tela Inicial
- A tela inicial deve dar acesso aos módulos de Tarefas, Músicas, Finanças e Anotações.
- Cada módulo deve manter seus próprios registros, filtros e operações CRUD.
- A interface deve manter o tema selecionado ao navegar entre os módulos.

# 5. Módulo de Tarefas
- Deve ter um input do tipo data, com a data atual selecionada.
- O sistema deve ter um modal para as operações CRUD.
- O usuário deve poder adicionar novas tarefas em um textarea, cada linha é uma tarefa.
- Terá 3 cards gráficos: total de tarefas, tarefas pendentes e tarefas realizadas, ao clicar filtra.
- Cada registro terá um checkbox para realizar a tarefa e um lápis para abrir o modal CRUD, e seta para cima e para baixo para subir ou descer a prioridade da tarefa (alterar a ordem de exibição).

# 6. Módulo de Músicas
## 6.1. Módulo da Tela Inicial (Home)
- **Ações e Filtros:**
  - Favoritar e editar (através de modal unificado).
  - Acesso rápido à visualização da música.
  - Busca inteligente por nome.
  - Filtro por categorias.
  - Abas de navegação rápida: "Todas", "Favoritas" e "Finalizadas".
- **Legenda de Resultados:** Contagem dinâmica de músicas em tempo real conforme os filtros aplicados.

## 6.2. Módulo de Visualização e Formatação de Cifras
- **Tonalidades:** C, C#, D, D#, E, F, F#, G, G#, A, A#, B
- **Notas:**
  - Maiores: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
  - Menores: Cm, C#m, Dm, D#m, Em, Fm, F#m, Gm, G#m, Am, A#m, Bm
  - Passagem: G#/C, A/C#, A#/D, B/D#, C/E, C#/F, D/F#, D#/G, E/G#, F/A, F#/A#, G/B
- **Estilização de Linhas Especiais:**
  - **Linhas com `*` (Títulos/Seções):** Destacadas com cor azul (azul vibrante no Dark Mode).
  - **Linhas de Solo:** Iniciadas com "Solo: ", recebem estilização visual destacada com cor harmonizada e borda lateral.
  - **Cifras e Tempos:**
    - Cores dinâmicas (texto preto no Light Mode e branco no Dark Mode).
    - Sem cor de fundo nas notas.
    - Aplicação de fundo exclusivo apenas nos cabeçalhos/blocos das cifras.
    - Notas com numeração ganham um número elevado: C4 vira C elevado a 4; C2.5 vira C elevado a 2.5.

# 7. Módulo de Finanças
## 7.1. Módulo da Tela Inicial
- Terá 3 cards gráficos: Entradas, Saídas, Saldo Total.
- Terá uma seta para esquerda, o mês padrão sendo o mês seguinte, e uma seta para a direita. As setas serão para navegar entre os meses.
- O sistema deve ter um modal para as operações CRUD, com os campos informados no item 7.2.
- Ao clicar no registro vai abrir a tela do modal CRUD.

## 7.2. CRUD
- Tipo (Select) (Saída, Entrada) (Padrão Saída)
- Título
- Valor
- Data (com base no mês selecionado)
- Status (Select) (Pendente, Realizado) (Padrão Pendente)

# 8. Módulo de Anotações
- O sistema deve ter um modal para as operações CRUD.
- Ao clicar no registro vai abrir a tela do modal CRUD.
- No campo categoria, vai ter um datalist sugerindo as categorias já cadastradas.

# 9. Módulo de Gerenciamento de Dados (Backup)
- **Tarefas:**
  - **Exportar JSON:** Funcionalidade de download contendo o backup de todas as tarefas cadastradas.
  - **Importar JSON (Overwrite):** Restauração e substituição integral das tarefas diretamente no banco Supabase.
- **Músicas:**
  - **Exportar JSON:** Funcionalidade de download contendo o backup de todas as músicas cadastradas.
  - **Importar JSON (Overwrite):** Restauração e substituição integral das músicas diretamente no banco Supabase.
- **Finanças:**
  - **Exportar JSON:** Funcionalidade de download contendo o backup de todas as finanças cadastradas.
  - **Importar JSON (Overwrite):** Restauração e substituição integral das finanças diretamente no banco Supabase.
- **Anotações:**
  - **Exportar JSON:** Funcionalidade de download contendo o backup de todas as anotações cadastradas.
  - **Importar JSON (Overwrite):** Restauração e substituição integral das anotações diretamente no banco Supabase.
