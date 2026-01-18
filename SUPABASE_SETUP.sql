-- 1. Create the 'media' bucket (Public) if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS (Should be on by default, but ensuring)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow Public Read Access (Anyone can view images)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'media' );

-- 4. Policy: Allow Public Uploads (Needed because we use custom auth, not Supabase Auth)
-- CAUTION: This allows anyone with your Anon Key to upload. 
-- For higher security, integrate Supabase Auth or use a Backend Relay (limited to 4.5MB).
CREATE POLICY "Allow Public Uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'media' );

-- 5. Policy: Allow Public Delete (Optional, usually restrict to backend, but adding for completeness)
-- We typically handle deletion via Service Role in the backend ID, so this might not be needed frontend-side.
-- CREATE POLICY "Allow Public Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'media' );
