create table if not exists tecnomat_kv (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists ordenes_trabajo (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo_orden text not null check (tipo_orden in ('montaje','proyecto')),
  interno_externo text not null check (interno_externo in ('Interno','Externo')),
  solicitante text not null,
  estado text not null default 'activo' check (estado in ('activo','finalizado')),
  origen text not null default 'tecnomat',
  plano text,
  created_at timestamptz not null default now()
);

create table if not exists orden_materiales (
  id uuid primary key default gen_random_uuid(),
  orden_id uuid not null references ordenes_trabajo(id) on delete cascade,
  codigo text not null,
  descripcion text,
  cantidad numeric not null default 1,
  referencia text
);

create table if not exists materiales (
  id uuid primary key default gen_random_uuid(),
  codigo_articulo text not null unique,
  descripcion text,
  stock_a3 numeric,
  precio_venta numeric,
  origen text not null default 'a3',
  updated_at timestamptz not null default now()
);

create table if not exists materiales_rapidos (
  id uuid primary key default gen_random_uuid(),
  codigo text,
  nombre text not null,
  orden integer not null default 0,
  updated_at timestamptz not null default now()
);

create or replace function ajustar_stock(clave text, item_id text, delta numeric, item_nuevo jsonb)
returns void
language plpgsql
as $$
declare
  catalogo jsonb;
  encontrado boolean := false;
  resultado jsonb := '[]'::jsonb;
  articulo jsonb;
begin
  select value into catalogo from tecnomat_kv where key = clave;
  if catalogo is null then catalogo := '[]'::jsonb; end if;

  for articulo in select * from jsonb_array_elements(catalogo) loop
    if articulo->>'id' = item_id then
      articulo := jsonb_set(articulo, '{qty}', to_jsonb(coalesce((articulo->>'qty')::numeric,0) + delta));
      encontrado := true;
    end if;
    resultado := resultado || jsonb_build_array(articulo);
  end loop;

  if not encontrado then
    resultado := resultado || jsonb_build_array(item_nuevo);
  end if;

  insert into tecnomat_kv (key, value, updated_at)
  values (clave, resultado, now())
  on conflict (key) do update set value = excluded.value, updated_at = now();
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['tecnomat_kv', 'ordenes_trabajo', 'materiales', 'materiales_rapidos'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table %I', t);
    end if;
  end loop;
end $$;

alter table tecnomat_kv enable row level security;
alter table ordenes_trabajo enable row level security;
alter table orden_materiales enable row level security;
alter table materiales enable row level security;
alter table materiales_rapidos enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['tecnomat_kv', 'ordenes_trabajo', 'orden_materiales', 'materiales', 'materiales_rapidos'] loop
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = t) then
      execute format(
        'create policy "lectura y escritura con sesión iniciada" on %I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'')', t
      );
    end if;
  end loop;
end $$;
