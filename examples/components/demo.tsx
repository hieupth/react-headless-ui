'use client';

import { useState, type ReactNode } from 'react';
import { CodeBlock } from './code-block';

interface DemoProps {
  code: string;
  children: ReactNode;
}

/**
 * Renders a live preview of children in a bordered box, plus a
 * "Show Code" toggle that reveals a highlighted <CodeBlock>.
 */
export function Demo({ code, children }: DemoProps) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="my-6 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Preview
        </span>
        <button
          type="button"
          onClick={() => setShowCode((v) => !v)}
          className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-expanded={showCode}
        >
          {showCode ? 'Hide Code' : 'Show Code'}
        </button>
      </div>

      <div className="p-6 flex items-center justify-center min-h-[120px] bg-white dark:bg-gray-950">
        {children}
      </div>

      {showCode && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <CodeBlock code={code} />
        </div>
      )}
    </div>
  );
}

export default Demo;
