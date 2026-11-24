-- Mise en Place: só administradores logados (mesmas contas do app Gestão de Produção).
do $$
declare t text;
begin
  foreach t in array array['mep_categorias','mep_itens','mep_extras','mep_historico','mep_receitas']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "so gestora" on public.%I for all to authenticated using (privado.sou_adm()) with check (privado.sou_adm())', t);
  end loop;
end $$;
