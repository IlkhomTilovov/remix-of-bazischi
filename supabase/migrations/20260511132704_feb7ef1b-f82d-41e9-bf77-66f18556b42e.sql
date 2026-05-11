CREATE TABLE public.spec_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.spec_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view spec templates"
ON public.spec_templates FOR SELECT
USING (true);

CREATE POLICY "Admins can manage spec templates"
ON public.spec_templates FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE TRIGGER update_spec_templates_updated_at
BEFORE UPDATE ON public.spec_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();