import fs from 'node:fs';
import path from 'node:path';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { Demo } from '@/components/demo';
import { CodeBlock } from '@/components/code-block';
import { InteractiveDemo } from '@/components/interactive-demo';

const docsDir = path.join(process.cwd(), 'docs');

/**
 * MDX components exposed to every docs page. Interactive pieces (e.g. a button
 * that fires `onPress`) are exposed as client components so their event-handler
 * props are constructed on the client — Server Components cannot pass function
 * props to Client Components, which would otherwise break the static export.
 */
const mdxComponents = { Demo, CodeBlock, InteractiveDemo };

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
    return { title: `${title} — @hieupth/react-headless-ui` };
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
    <article className="docs-prose prose dark:prose-invert">
      <MDXRemote
        source={source}
        components={mdxComponents}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </article>
  );
}

export default MDXPage;
