CREATE TABLE public.workshop_calls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workshop_id uuid,
  district_id uuid,
  region_id uuid,
  workshop_name text,
  district_name text,
  region_name text,
  phone text,
  session_id text,
  device_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.workshop_calls TO anon;
GRANT SELECT, INSERT ON public.workshop_calls TO authenticated;
GRANT ALL ON public.workshop_calls TO service_role;

ALTER TABLE public.workshop_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log a call" ON public.workshop_calls
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view calls" ON public.workshop_calls
  FOR SELECT USING (true);

CREATE INDEX idx_workshop_calls_workshop ON public.workshop_calls (workshop_id);
CREATE INDEX idx_workshop_calls_created ON public.workshop_calls (created_at);