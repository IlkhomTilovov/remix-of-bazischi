DROP POLICY IF EXISTS "Anyone can view active workshops" ON public.partner_workshops;

CREATE POLICY "Staff can view workshops"
ON public.partner_workshops
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'editor'::app_role)
);

CREATE OR REPLACE FUNCTION public.get_public_workshops(_district_id uuid)
RETURNS TABLE (
  id uuid, district_id uuid, name text, phone text, address text,
  experience_years integer, description text, sort_order integer, is_active boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT w.id, w.district_id, w.name, w.phone, w.address,
         w.experience_years, w.description, w.sort_order, w.is_active
  FROM public.partner_workshops w
  WHERE w.district_id = _district_id AND w.is_active = true
  ORDER BY w.sort_order ASC NULLS LAST, w.name ASC;
$$;

CREATE OR REPLACE FUNCTION public.get_public_workshop(_id uuid)
RETURNS TABLE (
  id uuid, district_id uuid, name text, phone text, address text,
  experience_years integer, description text, sort_order integer, is_active boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT w.id, w.district_id, w.name, w.phone, w.address,
         w.experience_years, w.description, w.sort_order, w.is_active
  FROM public.partner_workshops w
  WHERE w.id = _id AND w.is_active = true;
$$;

CREATE OR REPLACE FUNCTION public.get_active_workshop_district_ids()
RETURNS TABLE (district_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT w.district_id FROM public.partner_workshops w WHERE w.is_active = true;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_workshops(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_workshop(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_workshop_district_ids() TO anon, authenticated;

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can receive realtime messages" ON realtime.messages;
CREATE POLICY "Staff can receive realtime messages"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
  OR has_role(auth.uid(), 'seller'::app_role)
  OR has_role(auth.uid(), 'editor'::app_role)
);