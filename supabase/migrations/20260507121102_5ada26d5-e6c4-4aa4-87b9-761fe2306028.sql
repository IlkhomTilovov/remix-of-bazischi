CREATE OR REPLACE FUNCTION public.trigger_sitemap_regeneration()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM net.http_post(
    url := 'https://opfualjglbvogrisvnqe.supabase.co/functions/v1/generate-sitemap',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wZnVhbGpnbGJ2b2dyaXN2bnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNTgwMTMsImV4cCI6MjA5MzYzNDAxM30.2VLquXlj6SK6TdJ2qo6CTbDc8YbZZD-Cf2oLHiB1bHY'
    ),
    body := '{}'::jsonb
  );
  RETURN COALESCE(NEW, OLD);
END;
$function$;