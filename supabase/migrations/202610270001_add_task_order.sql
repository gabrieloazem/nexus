-- Execute uma vez no SQL Editor do projeto Supabase para habilitar a prioridade persistente das tarefas.
ALTER TABLE public.tarefas
  ADD COLUMN IF NOT EXISTS ordem INTEGER;

UPDATE public.tarefas
SET ordem = id
WHERE ordem IS NULL;

CREATE INDEX IF NOT EXISTS tarefas_ordem_idx ON public.tarefas (ordem, id);
