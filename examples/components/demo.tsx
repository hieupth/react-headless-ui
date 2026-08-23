'use client';

import { useId, useState, type ReactNode } from 'react';
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
  // Track whether the code panel has ever been opened so the shiki highlighter
  // (instantiated by <CodeBlock> on mount) is only created for panels the user
  // actually expands. On doc-heavy pages every Demo mounts a CodeBlock that is
  // otherwise always hidden; deferring its mount avoids running Shiki for code
  // that may never be viewed. Once mounted it stays mounted (re-collapse is
  // instant, re-expand reuses the highlighted HTML).
  const [codeMounted, setCodeMounted] = useState(false);
  // Per-instance id pairs the disclosure button with its controlled region so
  // assistive tech can jump to the code panel (aria-controls ↔ id). A stable
  // module-level constant would collide across the multiple <Demo> instances
  // rendered on a single page.
  const panelId = useId();

  return (
    <div className="demo-frame">
      <div className="demo-toolbar">
        <span className="demo-label">Preview</span>
        <button
          type="button"
          onClick={() => {
            setShowCode((v) => !v);
            setCodeMounted(true);
          }}
          className="demo-toggle"
          aria-expanded={showCode}
          aria-controls={panelId}
        >
          {showCode ? 'Hide Code' : 'Show Code'}
        </button>
      </div>

      <div className="demo-canvas">
        {children}
      </div>

      <div id={panelId} className="demo-code-panel" hidden={!showCode}>
        {codeMounted && <CodeBlock code={code} />}
      </div>
    </div>
  );
}

export default Demo;
