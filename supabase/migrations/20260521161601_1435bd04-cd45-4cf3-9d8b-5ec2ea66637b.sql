
-- Sayt tashriflarini sanash uchun jadval
CREATE TABLE IF NOT EXISTS public.site_visits (
  id INT PRIMARY KEY DEFAULT 1,
  total_visits BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO public.site_visits (id, total_visits)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- Hamma o'qiy oladi (footer'da ko'rsatish uchun)
CREATE POLICY "Anyone can read visits"
ON public.site_visits FOR SELECT
USING (true);

-- Sanagichni xavfsiz oshirish uchun funksiya
CREATE OR REPLACE FUNCTION public.increment_site_visit()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total BIGINT;
BEGIN
  UPDATE public.site_visits
  SET total_visits = total_visits + 1,
      updated_at = now()
  WHERE id = 1
  RETURNING total_visits INTO new_total;
  RETURN new_total;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_site_visit() TO anon, authenticated;
