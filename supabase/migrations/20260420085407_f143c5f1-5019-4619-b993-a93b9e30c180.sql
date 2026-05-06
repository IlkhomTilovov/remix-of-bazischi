INSERT INTO public.themes (name, slug, is_active, is_dark, color_palette, typography, component_styles, layout_settings)
VALUES (
  'Default Warm',
  'default-warm',
  true,
  false,
  '{
    "background": "30 25% 97%",
    "foreground": "25 30% 15%",
    "card": "0 0% 100%",
    "cardForeground": "25 30% 15%",
    "popover": "0 0% 100%",
    "popoverForeground": "25 30% 15%",
    "primary": "25 60% 35%",
    "primaryForeground": "30 25% 97%",
    "secondary": "30 20% 92%",
    "secondaryForeground": "25 30% 15%",
    "muted": "30 15% 94%",
    "mutedForeground": "25 15% 45%",
    "accent": "35 70% 55%",
    "accentForeground": "25 30% 15%",
    "destructive": "0 70% 50%",
    "destructiveForeground": "0 0% 100%",
    "border": "30 15% 88%",
    "input": "30 15% 88%",
    "ring": "25 60% 35%",
    "warmCream": "35 40% 95%",
    "warmBeige": "35 30% 85%",
    "warmBrown": "25 50% 30%",
    "darkWood": "20 40% 20%",
    "goldAccent": "40 80% 55%",
    "sageGreen": "100 20% 45%"
  }'::jsonb,
  '{
    "fontSans": "Inter, system-ui, sans-serif",
    "fontSerif": "Georgia, serif",
    "fontHeading": "Inter, system-ui, sans-serif"
  }'::jsonb,
  '{
    "borderRadius": "0.5rem",
    "buttonRadius": "0.5rem",
    "cardRadius": "0.75rem",
    "shadowSm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "shadowMd": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    "shadowLg": "0 10px 15px -3px rgb(0 0 0 / 0.1)"
  }'::jsonb,
  '{
    "containerMaxWidth": "1280px",
    "sectionSpacing": "5rem",
    "cardPadding": "1.5rem"
  }'::jsonb
);