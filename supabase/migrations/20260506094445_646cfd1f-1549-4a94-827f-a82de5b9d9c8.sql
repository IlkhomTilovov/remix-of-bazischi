
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Recreate trigger function with correct project ref
CREATE OR REPLACE FUNCTION public.trigger_sitemap_regeneration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://fqijsixeemznknwmlhpz.supabase.co/functions/v1/generate-sitemap',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxaWpzaXhlZW16bmtud21saHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NzEwMDksImV4cCI6MjA5MjI0NzAwOX0.1pEkh8FuIOx9czit1riliY2-BUhhCu4ok_gO5xYP0jQ'
    ),
    body := '{}'::jsonb
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop existing triggers if any
DROP TRIGGER IF EXISTS regenerate_sitemap_on_products ON public.products;
DROP TRIGGER IF EXISTS regenerate_sitemap_on_categories ON public.categories;

-- Create triggers
CREATE TRIGGER regenerate_sitemap_on_products
AFTER INSERT OR UPDATE OR DELETE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.trigger_sitemap_regeneration();

CREATE TRIGGER regenerate_sitemap_on_categories
AFTER INSERT OR UPDATE OR DELETE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.trigger_sitemap_regeneration();
