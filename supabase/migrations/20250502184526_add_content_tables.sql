-- Tabelas para Destinos, Fotos e Áudios

-- Tabela de Destinos
CREATE TABLE IF NOT EXISTS destinations (
  id bigint primary key generated always as identity,
  name text not null,
  description text,
  location text,
  price numeric(10, 2) not null default 0.00,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to destinations"
    ON destinations
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admin users to manage destinations"
    ON destinations
    FOR ALL
    USING (auth.role() = 'authenticated') -- Placeholder, refine later for specific admin role
    WITH CHECK (auth.role() = 'authenticated'); -- Placeholder

-- Tabela de Fotos
CREATE TABLE IF NOT EXISTS photos (
  id bigint primary key generated always as identity,
  destination_id bigint references destinations(id) on delete cascade,
  url text not null,
  alt_text text,
  created_at timestamp with time zone default now()
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to photos"
    ON photos
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admin users to manage photos"
    ON photos
    FOR ALL
    USING (auth.role() = 'authenticated') -- Placeholder
    WITH CHECK (auth.role() = 'authenticated'); -- Placeholder

-- Tabela de Áudios
CREATE TABLE IF NOT EXISTS audios (
  id bigint primary key generated always as identity,
  destination_id bigint references destinations(id) on delete cascade,
  url text not null,
  title text,
  created_at timestamp with time zone default now()
);

ALTER TABLE audios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to audios"
    ON audios
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admin users to manage audios"
    ON audios
    FOR ALL
    USING (auth.role() = 'authenticated') -- Placeholder
    WITH CHECK (auth.role() = 'authenticated'); -- Placeholder

-- Configurar armazenamento (Storage) para fotos e áudios (se ainda não existir)
-- Supabase Storage Buckets: 'destination_photos', 'destination_audios'
-- As políticas de acesso aos buckets precisam ser configuradas no dashboard do Supabase ou via CLI.
-- Exemplo de política para bucket 'destination_photos' (pode precisar de ajuste):
-- CREATE POLICY "Allow public read access to photos bucket" ON storage.objects FOR SELECT USING ( bucket_id = 'destination_photos' );
-- CREATE POLICY "Allow admin upload to photos bucket" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'destination_photos' AND auth.role() = 'authenticated' ); -- Placeholder

-- Exemplo de política para bucket 'destination_audios' (pode precisar de ajuste):
-- CREATE POLICY "Allow public read access to audios bucket" ON storage.objects FOR SELECT USING ( bucket_id = 'destination_audios' );
-- CREATE POLICY "Allow admin upload to audios bucket" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'destination_audios' AND auth.role() = 'authenticated' ); -- Placeholder

