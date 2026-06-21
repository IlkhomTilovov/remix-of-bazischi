CREATE TABLE public.partner_brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  sort_order INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.partner_brands TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_brands TO authenticated;
GRANT ALL ON public.partner_brands TO service_role;

ALTER TABLE public.partner_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active brands"
ON public.partner_brands FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert brands"
ON public.partner_brands FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update brands"
ON public.partner_brands FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete brands"
ON public.partner_brands FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_partner_brands_updated_at
BEFORE UPDATE ON public.partner_brands
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();