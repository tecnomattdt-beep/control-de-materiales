-- Enlace con la app hermana: lo que Tecnomat lee de ella.
-- Ejecutar en el Supabase compartido DESPUÉS de supabase_setup.sql, supabase_chat_externo.sql y supabase_seguridad.sql.
-- Se puede volver a ejecutar. Solo añade: no borra ni cambia datos.
--
-- Contrato (lo que Tecnomat espera; la app hermana lo rellena):
--   ordenes_trabajo      OT activas. Tecnomat crea su orden/proyecto al llegar una (o al abrirse, si llegó con la app cerrada).
--   orden_materiales     Material inicial de cada OT.
--   tecnomat_esquemas    Esquemas/planos de cada OT: nombre + enlace https.
--   tecnomat_trabajadores Trabajadores. Tecnomat los añade a su lista (no borra los suyos).
-- Tecnomat SOLO LEE estas tablas. La app hermana escribe en ellas con sus propios permisos
-- (o con la clave service_role desde su servidor, que no pasa por estas políticas).

alter table ordenes_trabajo add column if not exists numero text;
alter table ordenes_trabajo add column if not exists cliente text;

create table if not exists tecnomat_esquemas (
  id uuid primary key default gen_random_uuid(),
  orden_id uuid not null references ordenes_trabajo(id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 120),
  url text not null check (url ~ '^https://[^\s"''<>]+$'),
  created_at timestamptz not null default now()
);
create index if not exists tecnomat_esquemas_orden on tecnomat_esquemas (orden_id);

create table if not exists tecnomat_trabajadores (
  id text primary key,                      -- el identificador del trabajador en la app hermana
  nombre text not null check (char_length(nombre) between 1 and 80),
  puesto text not null default '' check (char_length(puesto) <= 80),
  activo boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table tecnomat_esquemas enable row level security;
alter table tecnomat_trabajadores enable row level security;

-- Las cuentas de Tecnomat solo leen. Las tablas que ya existían (ordenes_trabajo, orden_materiales)
-- conservan la política de supabase_seguridad.sql.
do $$
declare t text;
begin
  foreach t in array array['tecnomat_esquemas', 'tecnomat_trabajadores'] loop
    execute format('drop policy if exists "Tecnomat lee" on %I', t);
    execute format('create policy "Tecnomat lee" on %I for select to authenticated using (es_usuario_tecnomat())', t);
  end loop;
end $$;

-- Si la app hermana ya guarda las OT en su propia tabla, lo más simple es un disparador que copie
-- cada OT nueva aquí. Ejemplo (cambiar «ot_hermana» y sus columnas por las reales):
--
-- create or replace function copiar_ot_a_tecnomat() returns trigger language plpgsql security definer set search_path = public as $$
-- begin
--   insert into ordenes_trabajo (id, nombre, numero, cliente, tipo_orden, interno_externo, solicitante, plano)
--   values (new.id, new.titulo, new.numero, new.cliente, 'montaje', 'Interno', coalesce(new.responsable, ''), new.plano)
--   on conflict (id) do nothing;
--   return new;
-- end $$;
-- create trigger copiar_ot_a_tecnomat after insert on ot_hermana for each row execute function copiar_ot_a_tecnomat();
