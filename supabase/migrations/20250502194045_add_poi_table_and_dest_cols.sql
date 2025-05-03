-- Adicionar colunas em falta à tabela 'destinations'
ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS image_url text, -- Corresponds to imageUrl in AdminPage.tsx
ADD COLUMN IF NOT EXISTS intro_audio_url text; -- Corresponds to introAudioUrl in AdminPage.tsx

-- Tabela de Pontos de Interesse (POIs)
CREATE TABLE IF NOT EXISTS points_of_interest (
  id bigint primary key generated always as identity,
  destination_id bigint references destinations(id) on delete cascade not null,
  name text not null,
  description text,
  image_url text, -- Corresponds to imageUrl in AdminPage.tsx state for POI
  audio_url text not null, -- Corresponds to audioUrl in AdminPage.tsx state for POI
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

ALTER TABLE points_of_interest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to points_of_interest"
    ON points_of_interest
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admin users to manage points_of_interest"
    ON points_of_interest
    FOR ALL
    USING (auth.role() = 'authenticated') -- Placeholder, refine later for specific admin role
    WITH CHECK (auth.role() = 'authenticated'); -- Placeholder

-- Nota: As tabelas 'photos' e 'audios' criadas anteriormente podem ser usadas para uploads futuros,
-- mas a AdminPage atual parece usar URLs diretas em 'destinations' e 'points_of_interest'.
-- Manter as tabelas 'photos' e 'audios' por enquanto.

