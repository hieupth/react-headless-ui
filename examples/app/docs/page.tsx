import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';

/**
 * Index page for bare `/docs/` (and `/docs`). The sibling `[...slug]` catch-all
 * requires at least one segment, so without this route the natural `/docs/`
 * URL would hit the static-export 404. This page lists every `docs/*.mdx`
 * entry with a human-friendly label and links into it.
 */
const docsDir = path.join(process.cwd(), 'docs');

function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function generateMetadata() {
  return { title: 'Docs — @hieupth/react-headless-ui' };
}

export default function DocsIndexPage() {
  const docs = fs.existsSync(docsDir)
    ? fs
        .readdirSync(docsDir)
        .filter((file) => file.endsWith('.mdx'))
        .map((file) => file.replace(/\.mdx$/, ''))
        .sort()
    : [];

  return (
    <article className="prose dark:prose-invert max-w-3xl mx-auto px-6 py-10">
      <h1>Docs</h1>
      <p>Guides for <code>@hieupth/react-headless-ui</code>.</p>
      <ul>
        {docs.map((slug) => (
          <li key={slug}>
            <Link href={`/docs/${slug}/`}>{titleFromSlug(slug)}</Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
