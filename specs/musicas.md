# 1. Sistema
- **Nome:** Músicas
- **Tecnologias:** HTML5, Tailwind CSS, JavaScript, Supabase

# 2. Requisitos Técnicos
- **Arquitetura:** Sistema monolítico.
- **Responsividade:** Interface adaptável para smartphones e desktops.
- **Interface:** Suporte a tema Claro e Escuro (Light/Dark Mode) com persistência via `localStorage` e correção de alternância automática/manual.

# 3. Banco de Dados (Supabase)
- **URL:** https://supabase.com/dashboard/project/zdriboihloujzdjgtbmq/editor
- **ANON_KEY:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkcmlib2lobG91anpkamd0Ym1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDc0MDIsImV4cCI6MjA5NDA4MzQwMn0.GqD3hDxuytt9HSHfqF0S5PR0er01Hq9Z6VMZhU3InGc

## 3.1. Tabela: musicas
- `id`: SERIAL Primary Key
- `nome`: TEXT
- `favoritas`: BOOLEAN DEFAULT false
- `finalizada`: BOOLEAN DEFAULT false
- `conteudo`: TEXT
- `categorias`: TEXT
- `tonalidade`: TEXT

# 4. Módulo da Tela Inicial (Home)
- **Ações e Filtros:** 
  - Favoritar e editar (através de modal unificado).
  - Acesso rápido à visualização da música.
  - Busca inteligente por nome.
  - Filtro por categorias.
  - Abas de navegação rápida: "Todas", "Favoritas" e "Finalizadas".
- **Legenda de Resultados:** Contagem dinâmica de músicas em tempo real conforme os filtros aplicados.

# 5. Módulo de Visualização e Formatação de Cifras
- **Tonalidades:**: C, C#, D, D#, E, F, F#, G, G#, A, A#, B 
- **Notas**:
  - Maiores: C, C#, D, D#, E, F, F#, G, G#, A, A#, B 
  - Menores: Cm, C#m, Dm, D#m, Em, Fm, F#m, Gm, G#m, Am, A#m, Bm
  - Passagem: G#/C, A/C#, A#/D, B/D#, C/E, C#/F, D/F#, D#/G, E/G#, F/A, F#/A#, G/B 
- **Estilização de Linhas Especiais:**
  - **Linhas com `*` (Títulos/Seções):** Destacadas com cor azul (azul vibrante no Dark Mode).
  - **Linhas de Solo:** Iniciadas com `"Solo: "`, recebem estilização visual destacada com cor harmonizada e borda lateral.
  - **Cifras e Tempos:** 
    - Cores dinâmicas (texto preto no Light Mode e branco no Dark Mode).
    - **Sem cor de fundo nas notas.**
    - Aplicação de fundo exclusivo apenas nos cabeçalhos/blocos das cifras.
    - Notas com numeração ganham um numero elevado:
      - C4 vira C elevado a 4
      - C2.5 vira C elevado a 2.5

# 6. Módulo de Gerenciamento de Dados (Backup)
- **Exportar JSON:** 
  - Funcionalidade de download contendo o backup de todas as músicas cadastradas.
- **Importar JSON (Overwrite):** 
  - Restauração e substituição integral dos dados diretamente no banco Supabase.