-- Mise en Place: histórico semanal de contagens.
-- Uma linha por semana (id = data da segunda-feira, ex: '2026-11-23'),
-- com a foto do estoque no fim daquela semana em "itens" (jsonb).
create table if not exists public.mep_contagens (
  id text primary key,
  atualizado_em timestamptz not null default now(),
  itens jsonb not null default '[]'::jsonb
);

alter table public.mep_contagens enable row level security;
create policy "so gestora" on public.mep_contagens
  for all to authenticated using (privado.sou_adm()) with check (privado.sou_adm());
