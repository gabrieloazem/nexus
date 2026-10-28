# Nexus

Aplicação única com módulos para Tarefas, Músicas, Finanças e Anotações.

## Iniciar localmente

O navegador precisa abrir a aplicação por um servidor HTTP para carregar os módulos JavaScript. Com Python instalado, abra o terminal nesta pasta e execute:

```powershell
py -m http.server 8000
```

Depois acesse <http://localhost:8000>.

## Supabase

- A aplicação usa o projeto Supabase descrito em `nexus.md`.
- As tabelas `tarefas`, `musicas`, `financas` e `anotacoes` devem existir com os campos descritos em `nexus.md`.
- Execute `supabase/migrations/202610270001_add_task_order.sql` no SQL Editor do Supabase para salvar a ordem personalizada das tarefas.
- O acesso REST requer políticas RLS que permitam as operações usadas pela aplicação. O projeto não configura políticas automaticamente.
- A chave anon fica no navegador e só deve ser usada com políticas adequadas no Supabase.

## Arquivos principais

- `index.html` e `styles.css`: estrutura e interface compartilhada.
- `src/app.js`: navegação entre módulos.
- `src/services/supabase.js`: chamadas REST compartilhadas.
- `src/modules/`: funcionalidades específicas de cada módulo.
- `supabase/migrations/`: ajustes de esquema necessários.
  