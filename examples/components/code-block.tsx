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
    <div className="code-block">
      <button
        type="button"
        onClick={handleCopy}
        className="code-copy"
        aria-label="Copy code"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      {html ? (
        <div
          className="overflow-x-auto [&>pre]:!m-0 [&>pre]:!bg-transparent [&>pre]:p-4"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto p-4" style={{ background: '#0d1117', color: '#f3f4f6' }}>
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

export default CodeBlock;
