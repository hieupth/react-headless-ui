import fs from 'node:fs';
import path from 'node:path';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Demo } from '@/components/demo';
import { CodeBlock } from '@/components/code-block';

const docsDir = path.join(process.cwd(), 'docs');

/** MDX components exposed to every docs page. */
const mdxComponents = { Demo, CodeBlock };

/**
 * List every docs/*.mdx file as a static `[...slug]` param so the static
 * export pre-renders each page at build time.
 */
export function generateStaticParams() {
  if (!fs.existsSync(docsDir)) return [];
  return fs
    .readdirSync(docsDir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => ({
      slug: file.replace(/\.mdx$/, '').split('/'),
    }));
}

/** Human-friendly title derived from the slug. */
export function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }) {
  return params.then((p) => {
    const last = p.slug?.[p.slug.length - 1] ?? 'docs';
    const title = last
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return { title: `${title} — @hieupth/reui` };
  });
}

interface MDXPageProps {
  params: Promise<{ slug?: string[] }>;
}

/**
 * Reads the MDX source from disk at build time and renders it via the RSC
 * MDXRemote. Static-export compatible: the fs read happens at build, the
 * emitted HTML contains no runtime fs access.
 */
async function MDXPage({ params }: MDXPageProps) {
  const { slug } = await params;
  const slugPath = slug?.join('/') ?? '';
  const filePath = path.join(docsDir, `${slugPath}.mdx`);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const source = fs.readFileSync(filePath, 'utf8');

  return (
    <article className="prose dark:prose-invert max-w-3xl mx-auto px-6 py-10">
      <MDXRemote source={source} components={mdxComponents} />
    </article>
  );
}

export default MDXPage;
