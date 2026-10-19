-- Chat externo de Taller — ejecutar UNA vez en Supabase (SQL Editor → New query → Run),
-- después de supabase_setup.sql.
--
-- Permite que otra aplicación muestre dentro de sí el chat de una orden mediante la página
-- chat.html. El acceso anónimo se limita a dos funciones que exigen el identificador de la
-- orden y su clave; las tablas solo son accesibles con sesión iniciada (y, tras ejecutar
-- supabase_seguridad.sql, solo para los correos autorizados).

create table if not exists chat_externo (
  id uuid primary key default gen_random_uuid(),
  token text not null default replace(gen_random_uuid()::text, '-', ''),
  modo text not null check (modo in ('montaje','proyecto')),
  nombre text not null,
  created_at timestamptz not null default now()
);

create table if not exists chat_externo_mensajes (
  id uuid primary key default gen_random_uuid(),
  ot_id uuid not null references chat_externo(id) on delete cascade,
  autor text not null,
  texto text not null,
  cantidad integer not null default 1,
  codigo text,
  importado boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists chat_externo_mensajes_ot on chat_externo_mensajes (ot_id, created_at);

alter table chat_externo enable row level security;
alter table chat_externo_mensajes enable row level security;

-- Las políticas solo se crean si la tabla aún no tiene ninguna, de modo que volver a ejecutar este
-- archivo (por ejemplo, para actualizar las funciones) no deshace las restricciones de supabase_seguridad.sql.
do $$
declare
  t text;
begin
  foreach t in array array['chat_externo', 'chat_externo_mensajes'] loop
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = t) then
      execute format(
        'create policy "lectura y escritura con sesión iniciada" on %I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'')', t
      );
    end if;
  end loop;
end $$;

create or replace function chat_ext_leer(p_ot uuid, p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v chat_externo;
begin
  select * into v from chat_externo where id = p_ot and token = p_token;
  if not found then
    raise exception 'Enlace no válido' using errcode = '28000';
  end if;
  return jsonb_build_object(
    'nombre', v.nombre,
    'mensajes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', m.id, 'autor', m.autor, 'texto', m.texto, 'cantidad', m.cantidad,
        'codigo', m.codigo, 'importado', m.importado, 'created_at', m.created_at
      ) order by m.created_at)
      from (select * from chat_externo_mensajes where ot_id = p_ot order by created_at desc limit 100) m
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function chat_ext_enviar(p_ot uuid, p_token text, p_autor text, p_texto text, p_cantidad integer, p_codigo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from chat_externo where id = p_ot and token = p_token) then
    raise exception 'Enlace no válido' using errcode = '28000';
  end if;
  if length(trim(coalesce(p_autor, ''))) = 0 or length(trim(coalesce(p_texto, ''))) = 0 then
    raise exception 'Faltan datos';
  end if;
  if (select count(*) from chat_externo_mensajes where ot_id = p_ot and created_at > now() - interval '1 minute') >= 20 then
    raise exception 'Demasiados mensajes seguidos';
  end if;
  if (select count(*) from chat_externo_mensajes where ot_id = p_ot) >= 2000 then
    raise exception 'Chat lleno';
  end if;
  insert into chat_externo_mensajes (ot_id, autor, texto, cantidad, codigo)
  values (p_ot, left(trim(p_autor), 60), left(trim(p_texto), 300), greatest(1, least(coalesce(p_cantidad, 1), 9999)), nullif(left(trim(coalesce(p_codigo, '')), 60), ''));
end;
$$;

revoke all on function chat_ext_leer(uuid, text) from public;
revoke all on function chat_ext_enviar(uuid, text, text, text, integer, text) from public;
grant execute on function chat_ext_leer(uuid, text) to anon, authenticated;
grant execute on function chat_ext_enviar(uuid, text, text, text, integer, text) to anon, authenticated;
