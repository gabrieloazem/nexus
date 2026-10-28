# 1. Sistema
- **Nome:** Tarefas
- **Tecnologias:** HTML5, Tailwind CSS, JavaScript, Supabase

# 2. Requisitos Técnicos
- **Arquitetura:** Sistema monolítico.
- **Responsividade:** Interface adaptável para smartphones e desktops.
- **Interface:** Suporte a tema Claro e Escuro (Light/Dark Mode) com persistência via `localStorage` e correção de alternância automática/manual.
- **Exclusão:** Toda exclusão deve ter um confirm antes

# 3. Banco de Dados (Supabase)
- **URL:** https://supabase.com/dashboard/project/zdriboihloujzdjgtbmq/editor
- **ANON_KEY:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkcmlib2lobG91anpkamd0Ym1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDc0MDIsImV4cCI6MjA5NDA4MzQwMn0.GqD3hDxuytt9HSHfqF0S5PR0er01Hq9Z6VMZhU3InGc

## 3.1. Tabela: tarefas
- `id`: SERIAL Primary Key
- `data`: DATE
- `nome`: TEXT
- `finalizada`: BOOLEAN DEFAULT false

# 4. Módulo da Tela Inicial
- Deve ter um input do tipo data, com a data atual selecionada
- O sistema deve ter um modal para as operações CRUD
- O usuário deve poder adicionar novas tarefas em um textarea, cada linha é uma tarefa
- tera 3 cards graficos, total de tarefas, tarefas pendentes e tarefas realizadas, ao clicar filtra
- Cada registro terá um checkbox para realizar a tarefa e um lapis para abrir o modal crud, e seta para cima e para baixo para subir ou descer a prioridade da tarefa ( alterar a ordem de exibição )

# 5. Módulo de Gerenciamento de Dados (Backup)
- **Exportar JSON:** 
  - Funcionalidade de download contendo o backup de todas as tarefas cadastradas.
- **Importar JSON (Overwrite):** 
  - Restauração e substituição integral dos dados diretamente no banco Supabase.