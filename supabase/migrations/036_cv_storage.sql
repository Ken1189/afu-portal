-- Create CVs storage bucket for job applications
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read CVs (admin needs to view them)
CREATE POLICY "cv_read" ON storage.objects FOR SELECT USING (bucket_id = 'cvs');
CREATE POLICY "cv_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cvs' AND auth.role() = 'authenticated');
CREATE POLICY "cv_delete" ON storage.objects FOR DELETE USING (bucket_id = 'cvs' AND auth.role() = 'authenticated');
