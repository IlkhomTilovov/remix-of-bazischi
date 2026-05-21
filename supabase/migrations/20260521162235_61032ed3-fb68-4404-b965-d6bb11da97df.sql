
CREATE TABLE IF NOT EXISTS public.page_visits (
  id BIGSERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_visits_created_at ON public.page_visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_visits_path ON public.page_visits(path);
CREATE INDEX IF NOT EXISTS idx_page_visits_session ON public.page_visits(session_id);

ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log a page visit"
ON public.page_visits FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(btrim(path)) > 0 AND length(path) <= 500
  AND length(btrim(session_id)) > 0 AND length(session_id) <= 100
);

CREATE POLICY "Anyone can view page visits"
ON public.page_visits FOR SELECT
USING (true);
