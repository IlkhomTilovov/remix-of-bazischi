CREATE TABLE public.partner_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.partner_districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id uuid NOT NULL REFERENCES public.partner_regions(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.partner_workshops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid NOT NULL REFERENCES public.partner_districts(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  address text,
  experience_years integer,
  description text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.partner_regions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_regions TO authenticated;
GRANT ALL ON public.partner_regions TO service_role;
GRANT SELECT ON public.partner_districts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_districts TO authenticated;
GRANT ALL ON public.partner_districts TO service_role;
GRANT SELECT ON public.partner_workshops TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_workshops TO authenticated;
GRANT ALL ON public.partner_workshops TO service_role;

ALTER TABLE public.partner_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_workshops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active regions" ON public.partner_regions FOR SELECT USING (true);
CREATE POLICY "Admins manage regions" ON public.partner_regions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Anyone can view active districts" ON public.partner_districts FOR SELECT USING (true);
CREATE POLICY "Admins manage districts" ON public.partner_districts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Anyone can view active workshops" ON public.partner_workshops FOR SELECT USING (true);
CREATE POLICY "Admins manage workshops" ON public.partner_workshops FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_partner_regions_updated BEFORE UPDATE ON public.partner_regions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_partner_districts_updated BEFORE UPDATE ON public.partner_districts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_partner_workshops_updated BEFORE UPDATE ON public.partner_workshops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();