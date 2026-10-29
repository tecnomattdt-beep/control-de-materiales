create table if not exists tecnomat_usuarios (
  email text primary key check (email = lower(email))
);
alter table tecnomat_usuarios enable row level security;

insert into tecnomat_usuarios (email) values
  ('almacen@tecnomat.es'),
  ('taller@tecnomat.es')
on conflict do nothing;

create or replace function es_usuario_tecnomat()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from tecnomat_usuarios
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function es_usuario_tecnomat() from public, anon;
grant execute on function es_usuario_tecnomat() to authenticated;

do $$
declare
  t text;
begin
  foreach t in array array[
    'tecnomat_kv', 'ordenes_trabajo', 'orden_materiales', 'materiales', 'materiales_rapidos',
    'chat_externo', 'chat_externo_mensajes'
  ] loop
    execute format('drop policy if exists "lectura y escritura con sesión iniciada" on %I', t);
    execute format('drop policy if exists "solo usuarios de Tecnomat" on %I', t);
    execute format(
      'create policy "solo usuarios de Tecnomat" on %I for all using (es_usuario_tecnomat()) with check (es_usuario_tecnomat())', t
    );
  end loop;
end $$;

revoke execute on function ajustar_stock(text, text, numeric, jsonb) from public, anon;
grant execute on function ajustar_stock(text, text, numeric, jsonb) to authenticated;
