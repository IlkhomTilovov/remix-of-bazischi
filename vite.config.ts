import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

const SUPABASE_URL = "https://fqijsixeemznknwmlhpz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxaWpzaXhlZW16bmtud21saHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NzEwMDksImV4cCI6MjA5MjI0NzAwOX0.1pEkh8FuIOx9czit1riliY2-BUhhCu4ok_gO5xYP0jQ";
const SITE_URL = "https://tanirovka.uz";

async function fetchJSON(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) return [];
  return res.json();
}

function generateSitemapPlugin() {
  return {
    name: "generate-sitemap",
    apply: "build" as const,
    async buildStart() {
      try {
        const [categories, products] = (await Promise.all([
          fetchJSON("categories?select=slug,updated_at&is_active=eq.true&is_indexed=eq.true&order=sort_order.asc"),
          fetchJSON("products?select=id,slug,updated_at&is_active=eq.true&is_indexed=eq.true&order=created_at.desc"),
        ])) as [any[], any[]];

        const now = new Date().toISOString();
        const staticUrls = [
          { loc: "/", priority: "1.0", changefreq: "daily" },
          { loc: "/catalog", priority: "0.9", changefreq: "daily" },
          { loc: "/about", priority: "0.7", changefreq: "monthly" },
          { loc: "/contact", priority: "0.6", changefreq: "monthly" },
          { loc: "/faq", priority: "0.5", changefreq: "monthly" },
        ];

        const urls = [
          ...staticUrls.map(
            (u) =>
              `  <url>\n    <loc>${SITE_URL}${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
          ),
          ...(categories as any[]).map(
            (c) =>
              `  <url>\n    <loc>${SITE_URL}/catalog?category=${c.slug}</loc>\n    <lastmod>${c.updated_at || now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
          ),
          ...(products as any[]).map(
            (p) =>
              `  <url>\n    <loc>${SITE_URL}/product/${p.slug || p.id}</loc>\n    <lastmod>${p.updated_at || now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
          ),
        ];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;

        fs.writeFileSync(path.resolve(__dirname, "public/sitemap.xml"), xml);
        console.log(`✅ Sitemap generated: ${categories.length} categories, ${products.length} products`);
      } catch (err) {
        console.error("⚠️  Sitemap generation failed:", err);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    generateSitemapPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
