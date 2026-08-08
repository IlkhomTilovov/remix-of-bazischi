ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES public.partner_brands(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);

COMMENT ON COLUMN public.products.brand_id IS 'Mahsulot brendi (partner_brands jadvaliga bog''langan, katalog filteri uchun)';
