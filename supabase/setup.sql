-- Correr en Supabase → SQL Editor

-- Tabla principal
create table if not exists comprobantes (
  id                     uuid primary key default gen_random_uuid(),
  image_url              text not null,
  image_hash             text,
  monto                  numeric,
  fecha_transaccion      date,
  referencia             text,
  banco                  text,
  remitente              text,
  destinatario           text,
  nombre_padre           text not null,
  status                 text not null default 'pendiente_revision'
                           check (status in ('valido', 'duplicado', 'pendiente_revision')),
  ocr_raw                jsonb,
  matched_comprobante_id uuid references comprobantes(id),
  created_at             timestamptz default now()
);

-- Sin RLS (herramienta interna, sin cuentas de usuario)
alter table comprobantes disable row level security;

-- Índices para las queries de detección de duplicados
create index if not exists idx_comprobantes_referencia  on comprobantes(referencia) where referencia is not null;
create index if not exists idx_comprobantes_status      on comprobantes(status);
create index if not exists idx_comprobantes_created_at  on comprobantes(created_at desc);

-- Storage bucket (público para que el servidor pueda descargar la imagen sin auth)
insert into storage.buckets (id, name, public)
values ('comprobantes-images', 'comprobantes-images', true)
on conflict (id) do nothing;

-- Políticas de storage: cualquiera puede subir y leer (bucket público)
create policy "Subida pública" on storage.objects
  for insert with check (bucket_id = 'comprobantes-images');

create policy "Lectura pública" on storage.objects
  for select using (bucket_id = 'comprobantes-images');
