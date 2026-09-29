import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../config';
import { getPosts } from '../lib/posts';
import { url } from '../lib/url';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: site.name,
    description: site.description,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.pubDate,
      description: p.data.description,
      link: url(`blog/${p.id}`),
    })),
  });
}
