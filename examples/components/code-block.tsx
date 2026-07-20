'use client';

import { useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';

interface CodeBlockProps {
  code: string;
  language?: string;
}

/**
 * Syntax-highlighted code block with a Copy button.
 * Uses shiki (tsx by default) and renders to highlighted HTML.
 */
export function CodeBlock({ code, language = 'tsx' }: CodeBlockProps) {
  const [html, setHtml] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    codeToHtml(code, { lang: language, theme: 'github-dark' })
      .then((out) => {
        if (!cancelled) setHtml(out);
      })
      .catch(() => {
        if (!cancelled) setHtml('');
      });
    return () => {
      cancelled = true;
    };
  }, [code, language]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (permissions / non-secure context)
    }
  }

  return (
    <div className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 px-2 py-1 text-xs rounded bg-gray-800/80 text-gray-100 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-700"
        aria-label="Copy code"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      {html ? (
        <div
          className="overflow-x-auto text-sm [&>pre]:!m-0 [&>pre]:!bg-transparent [&>pre]:p-4"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto text-sm p-4 bg-gray-900 text-gray-100">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

export default CodeBlock;
