# 1. Sistema
- **Nome:** Finanças
- **Tecnologias:** HTML5, Tailwind CSS, JavaScript, Supabase

# 2. Requisitos Técnicos
- **Arquitetura:** Sistema monolítico.
- **Responsividade:** Interface adaptável para smartphones e desktops.
- **Interface:** Suporte a tema Claro e Escuro (Light/Dark Mode) com persistência via `localStorage` e correção de alternância automática/manual.
- **Exclusão:** Toda exclusão deve ter um confirm antes

# 3. Banco de Dados (Supabase)
- **URL:** https://supabase.com/dashboard/project/zdriboihloujzdjgtbmq/editor
- **ANON_KEY:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkcmlib2lobG91anpkamd0Ym1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDc0MDIsImV4cCI6MjA5NDA4MzQwMn0.GqD3hDxuytt9HSHfqF0S5PR0er01Hq9Z6VMZhU3InGc

## 3.1. Tabela: financas
- id: SERIAL Primary Key
- tipo: TEXT (Entrada, Saída)
- titulo: TEXT
- valor: NUMERIC(12, 2)
- data: DATE
- status: TEXT (Pendente, Realizado)

# 4. Módulo de Gerenciamento de Dados (Backup)
- **Exportar JSON:** 
  - Funcionalidade de download contendo o backup de todas as finanças cadastradas.
- **Importar JSON (Overwrite):** 
  - Restauração e substituição integral dos dados diretamente no banco Supabase.

# 5. Módulo da Tela Inicial
- Terá 3 cards gráficos: Entradas, Saídas, Saldo Total
- Terá uma seta para esquerda, o mês padrão sendo o mês seguinte, e uma seta para a direita. As setas serão para navegar entre os meses
- O sistema deve ter um modal para as operações CRUD, com os campos informados no item 5.1
- Ao clicar no registro vai abrir a tela do modal CRUD

# 5.1 CRUD
- Tipo ( Select ) ( Saída, Entrada ) ( Padrao Saída )
- Título
- Valor
- Data ( Com base no mês selecionado )
- Status ( Select ) ( Pendente, Realizado ) ( Padrão Pendente )