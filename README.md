# Chai Masala site

Astro + TypeScript + Tailwind v4, statically generated, deployed to GitHub Pages via Actions.

```bash
npm install
npm run dev        # local dev at http://localhost:4321/chai-masala/
npm run build      # static build to dist/
npx astro check    # type check
npm run verify     # runs the original chai_scaling_calculator.html against the ported math
```

## Where things live
- `src/config.ts` — site name/tagline, contact email, nav, product details, **Stripe Payment Link** (`product.stripeUrl`)
- `src/content/blog/*.mdx` — the posts (see below)
- `src/pages/` — `index` (home = the post list), `blog/[id]` (a post), `calculator`, `shop`, `about`, `rss.xml`
- `src/lib/chai.ts` — calculator math (ported unchanged from the original HTML)
- `src/components/Calculator.astro` — calculator markup; `CalcCallout.astro` — "try the calculator" box for posts
- `src/styles/global.css` — palette tokens (`@theme`), calculator and post-typography styles
- `CHAI_CONTEXT.md`, `chai_scaling_calculator.html` — source material, kept in the repo (the verify script needs the HTML)

## Adding a post
Create `src/content/blog/my-post-slug.mdx` (the filename becomes the URL: `/blog/my-post-slug`):

```mdx
---
title: My post title
description: One-sentence summary (used in lists, RSS and social previews).
pubDate: 2026-10-05
tags: [Experiment, Tasting]      # labels only; no tag pages
heroImage: ../../assets/my-photo.jpg   # optional, put the file in src/assets
heroAlt: Describe the photo
# updatedDate: 2026-10-06        # optional
# startHere: true                # optional, features it on the home page
# draft: true                    # optional, excluded from the build
---
import CalcCallout from '../../components/CalcCallout.astro';
import Calculator from '../../components/Calculator.astro';

Write in Markdown. Add a link box:

<CalcCallout />

Or embed the full calculator inline (once per post):

<div class="not-prose my-8"><Calculator /></div>
```

Link to other pages with base-aware URLs (needed on the `github.io/<repo>` site): in MDX use
`import { url as siteUrl } from '../../lib/url';` then `<a href={siteUrl('blog/other-post')}>…</a>`
(don't import it as plain `url` — MDX reserves that name).
The two `[Placeholder]` posts are templates: replace them and delete `placeholder: true`.

## Go live (GitHub Pages, no custom domain)
1. Create an empty GitHub repo (keep the name `chai-masala`, or set `BASE_PATH` — the workflow reads it from Pages automatically).
2. `git remote add origin git@github.com:<user>/<repo>.git && git add -A && git commit -m "Initial site" && git branch -M main && git push -u origin main`
3. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Push to `main` (or run the workflow manually). Site appears at `https://<user>.github.io/<repo>/`.

## Later: custom domain
1. Pages settings → Custom domain → enter it. Add DNS: `CNAME www → <user>.github.io` (and A records `185.199.108.153`, `.109.153`, `.110.153`, `.111.153` for the apex).
2. Add `public/CNAME` containing the domain. **If GitHub also commits a root-level `CNAME`, leave both — deleting it clears the custom domain in Pages settings.**
3. Tick **Enforce HTTPS** once DNS resolves.
4. The workflow's `SITE_URL`/`BASE_PATH` come from Pages, so no code change is needed.
