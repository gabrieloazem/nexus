# 1. Sistema
- **Nome:** Anotações
- **Tecnologias:** HTML5, Tailwind CSS, JavaScript, Supabase
- **Favicon:** Icone compativel com atalho do android

# 2. Requisitos Técnicos
- **Arquitetura:** Sistema monolítico.
- **Responsividade:** Interface adaptável para smartphones e desktops.
- **Interface:** Suporte a tema Claro e Escuro (Light/Dark Mode) com persistência via `localStorage` e correção de alternância automática/manual.
- **Exclusão:** Toda exclusão deve ter um confirm antes

# 3. Banco de Dados (Supabase)
- **URL:** https://supabase.com/dashboard/project/zdriboihloujzdjgtbmq/editor
- **ANON_KEY:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkcmlib2lobG91anpkamd0Ym1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDc0MDIsImV4cCI6MjA5NDA4MzQwMn0.GqD3hDxuytt9HSHfqF0S5PR0er01Hq9Z6VMZhU3InGc

## 3.1. Tabela: anotacoes
- `id`: SERIAL Primary Key
- `categoria`: TEXT
- `titulo`: TEXT
- `conteudo`: TEXT

# 4. Módulo de Gerenciamento de Dados (Backup)
- **Exportar JSON:** 
  - Funcionalidade de download contendo o backup de todas as tarefas cadastradas.
- **Importar JSON (Overwrite):** 
  - Restauração e substituição integral dos dados diretamente no banco Supabase.

# 5. Módulo da Tela Inicial
- O sistema deve ter um modal para as operações CRUD
- Ao clicar no registro vai abrir a tela do modal CRUD
- No campo categoria, vai der um datalist sugerindo as categorias já cadastradas