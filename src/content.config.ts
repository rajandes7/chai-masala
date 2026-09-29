import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      /** Labels only (e.g. Experiment, Tasting, Science, Blend, Tool) — no tag pages. */
      tags: z.array(z.string()).default([]),
      heroImage: image().optional(),
      heroAlt: z.string().default(''),
      /** Shown in the "Start here" spot on the home page. */
      startHere: z.boolean().default(false),
      /** Marks sample content: shows a banner + badge. Delete the field when you replace the post. */
      placeholder: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
