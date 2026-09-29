import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// The deploy workflow sets SITE_URL / BASE_PATH from the GitHub repo, so the
// project URL (<username>.github.io/<repo>) is always right without editing.
// If you later add a custom domain: SITE_URL=https://yourdomain.com, BASE_PATH=/
const site = process.env.SITE_URL ?? 'https://example.github.io';
const base = process.env.BASE_PATH ?? '/chai-masala';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  integrations: [mdx(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
