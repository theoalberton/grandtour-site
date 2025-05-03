-- TEMPORARY RLS FIX FOR TESTING --
-- WARNING: This disables security and should NOT be used in production.

-- Drop existing restrictive policies (if they exist with these specific names)
DROP POLICY IF EXISTS "Allow admin users to manage destinations" ON destinations;
DROP POLICY IF EXISTS "Allow admin users to manage points_of_interest" ON points_of_interest;
DROP POLICY IF EXISTS "Allow admin users to manage photos" ON photos;
DROP POLICY IF EXISTS "Allow admin users to manage audios" ON audios;

-- Allow ALL authenticated users to perform ANY action on destinations
-- This is insecure but allows testing with the anon key if auth isn't fully set up
CREATE POLICY "TEMP - Allow all authenticated users full access to destinations" 
    ON destinations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow ALL authenticated users to perform ANY action on points_of_interest
CREATE POLICY "TEMP - Allow all authenticated users full access to POIs" 
    ON points_of_interest
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Optional: Relax policies for photos and audios tables if needed for testing uploads directly
-- (Though the current implementation uses Storage, these might be relevant if direct table access is attempted)
CREATE POLICY "TEMP - Allow all authenticated users full access to photos" 
    ON photos
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "TEMP - Allow all authenticated users full access to audios" 
    ON audios
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Re-enable RLS just in case it was disabled
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_of_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audios ENABLE ROW LEVEL SECURITY;

-- Note: Remember to replace these temporary policies with proper, secure RLS rules
-- based on user roles (e.g., checking an 'admin' role) before production deployment.

