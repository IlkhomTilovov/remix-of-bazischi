ALTER TABLE public.page_visits ADD COLUMN IF NOT EXISTS device_id TEXT;

CREATE INDEX IF NOT EXISTS idx_page_visits_device_id ON public.page_visits(device_id);

DROP POLICY IF EXISTS "Anyone can log a page visit" ON public.page_visits;

CREATE POLICY "Anyone can log a page visit"
ON public.page_visits
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(btrim(path)) > 0
  AND length(path) <= 500
  AND length(btrim(session_id)) > 0
  AND length(session_id) <= 100
  AND (device_id IS NULL OR length(device_id) <= 100)
);