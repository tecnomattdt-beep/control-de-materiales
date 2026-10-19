-- Tecnomat · Endurecimiento de la seguridad de Supabase.
-- Ejecutar UNA vez (SQL Editor → New query → Run), después de supabase_setup.sql y supabase_chat_externo.sql.
--
-- Orden recomendado:
--   1) En Authentication → Sign In / Providers, desactivar «Allow new users to sign up» ANTES de nada más.
--   2) En Authentication → Users, comprobar que solo existen las cuentas propias y crear las que falten
--      (mismo correo y misma contraseña que en Firebase; la app inicia sesión también en Supabase con ellas).
--   3) Ajustar los correos del bloque «insert» de más abajo y ejecutar este archivo.
--
-- Efecto: solo los correos de la tabla tecnomat_usuarios pueden leer y escribir. Una cuenta creada por
-- terceros deja de tener acceso a los datos.
-- Para autorizar una cuenta nueva:  insert into tecnomat_usuarios (email) values ('correo@dominio.es');

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
