-- CivicConnect private media bucket.
-- Run this migration after linking the Supabase CLI to the CivicConnect project.
insert into storage.buckets (id, name, public)
values ('civic-connect-data', 'civic-connect-data', false)
on conflict (id) do update set public = false;

-- The backend uses SUPABASE_SERVICE_ROLE for uploads and signed URLs.
-- No public or authenticated read policy is created. The backend service-role
-- client owns media access and returns short-lived signed URLs. Signed upload
-- tokens are scoped to one object and do not require a public bucket.
