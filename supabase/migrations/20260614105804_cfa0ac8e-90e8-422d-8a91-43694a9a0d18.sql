-- 1. workshop_calls: lock down sensitive read access
DROP POLICY IF EXISTS "Anyone can view calls" ON public.workshop_calls;
DROP POLICY IF EXISTS "Anyone can log a call" ON public.workshop_calls;

CREATE POLICY "Staff can view calls" ON public.workshop_calls
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'editor'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
    OR has_role(auth.uid(), 'seller'::app_role)
  );

CREATE POLICY "Anyone can log a call" ON public.workshop_calls
  FOR INSERT WITH CHECK (workshop_id IS NOT NULL);

-- Public-safe aggregate function (no phone/session/device exposed)
CREATE OR REPLACE FUNCTION public.get_workshop_call_counts()
RETURNS TABLE (
  workshop_id uuid,
  workshop_name text,
  district_name text,
  region_name text,
  call_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    wc.workshop_id,
    COALESCE(w.name, wc.workshop_name) AS workshop_name,
    COALESCE(d.name, wc.district_name) AS district_name,
    COALESCE(r.name, wc.region_name) AS region_name,
    count(*) AS call_count
  FROM public.workshop_calls wc
  LEFT JOIN public.partner_workshops w ON w.id = wc.workshop_id
  LEFT JOIN public.partner_districts d ON d.id = COALESCE(w.district_id, wc.district_id)
  LEFT JOIN public.partner_regions r ON r.id = COALESCE(d.region_id, wc.region_id)
  GROUP BY wc.workshop_id, COALESCE(w.name, wc.workshop_name),
           COALESCE(d.name, wc.district_name), COALESCE(r.name, wc.region_name)
  ORDER BY count(*) DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_workshop_call_counts() TO anon, authenticated;

-- 2. storage: remove overly broad authenticated write policies
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- 3. partner_workshops: public can only see active workshops
DROP POLICY IF EXISTS "Anyone can view active workshops" ON public.partner_workshops;
CREATE POLICY "Anyone can view active workshops" ON public.partner_workshops
  FOR SELECT USING (is_active = true);

-- 4. order_items: insert must reference an existing order
DROP POLICY IF EXISTS "Public can create order_items" ON public.order_items;
CREATE POLICY "Public can create order_items" ON public.order_items
  FOR INSERT WITH CHECK (
    quantity >= 1 AND quantity <= 100
    AND length(btrim(product_id)) > 0
    AND length(btrim(product_name_snapshot)) > 0
    AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id)
  );