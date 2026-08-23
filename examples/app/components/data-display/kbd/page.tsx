'use client';

import { Kbd, KbdShortcut } from '@hieupth/react-headless-ui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Kbd renders a single keyboard key as a styled <kbd>. KbdShortcut renders a
// full "modifier+key" combination. Both are headless on CSS — style them
// through className.
export default function KbdPage() {
  return (
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">Kbd</h1>
        <p className="docs-lead">
          A keyboard-key display backed by the headless{' '}
          <code className="docs-code">useKbd</code> hook. Use{' '}
          <code>Kbd</code> to show a single key (e.g. <kbd>Enter</kbd>) and{' '}
          <code>KbdShortcut</code> to render a parsed{" "}
          <code>modifier+key</code> combination such as{" "}
          <kbd>Ctrl</kbd>+<kbd>K</kbd> inside one keyed element. It maps physical
          keys to friendly display labels (Meta → ⌘), supports modifier symbols,
          and wires <code>aria-keyshortcuts</code> for accessibility.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Single keys</h2>
        <p className="docs-desc">
          Pass the key name as <code>value</code> or children.
        </p>
        <Demo
          code={`<Kbd className="rounded border border-gray-300 bg-gray-50 px-2 py-0.5 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800">Enter</Kbd>
<Kbd value="Escape" className="rounded border border-gray-300 bg-gray-50 px-2 py-0.5 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800" />
<Kbd value="ArrowUp" className="rounded border border-gray-300 bg-gray-50 px-2 py-0.5 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800" />`}
        >
          <div className="flex items-center gap-2">
            <Kbd className="rounded border border-gray-300 bg-gray-50 px-2 py-0.5 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800">Enter</Kbd>
            <Kbd value="Escape" className="rounded border border-gray-300 bg-gray-50 px-2 py-0.5 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800" />
            <Kbd value="ArrowUp" className="rounded border border-gray-300 bg-gray-50 px-2 py-0.5 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800" />
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Shortcuts</h2>
        <p className="docs-desc">
          <code>KbdShortcut</code> parses a <code>value</code> string into
          individual modifier + key badges.
        </p>
        <Demo
          code={`<KbdShortcut shortcut="Ctrl+K" className="rounded border border-gray-300 bg-gray-50 px-2 py-0.5 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800" />
<KbdShortcut shortcut="Shift+Alt+/" useModifierSymbols className="rounded border border-gray-300 bg-gray-50 px-2 py-0.5 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800" />`}
        >
          <div className="flex items-center gap-3">
            <KbdShortcut shortcut="Ctrl+K" className="rounded border border-gray-300 bg-gray-50 px-2 py-0.5 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800" />
            <KbdShortcut shortcut="Shift+Alt+/" useModifierSymbols className="rounded border border-gray-300 bg-gray-50 px-2 py-0.5 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800" />
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Interactive</h2>
        <p className="docs-desc">
          Set <code>interactive</code> to make the key clickable (it fires{' '}
          <code>onPress</code> on press with an <code>aria-pressed</code> state).
        </p>
        <Demo
          code={`<Kbd value="F" interactive onPress={() => alert('pressed')} className="cursor-pointer rounded border border-gray-300 bg-gray-50 px-2 py-0.5 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800" />`}
        >
          <Kbd value="F" interactive onPress={() => alert('pressed')} className="cursor-pointer rounded border border-gray-300 bg-gray-50 px-2 py-0.5 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800" />
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
        <PropsTable
          props={[
            { name: 'value / defaultValue', type: 'string', default: '—', description: 'Controlled / initial key value.' },
            { name: 'children', type: 'ReactNode', default: '—', description: 'Override the displayed key text.' },
            { name: 'showModifiers', type: 'boolean', default: '—', description: 'Render modifier prefixes on a single Kbd.' },
            { name: 'useModifierSymbols', type: 'boolean', default: '—', description: 'Map Ctrl→⌃, Shift→⇧, Alt→⌥, Meta→⌘.' },
            { name: 'interactive', type: 'boolean', default: 'false', description: 'Make the key clickable with aria-pressed.' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable interaction.' },
            { name: 'keyMap', type: 'Record<string, string>', default: '—', description: 'Custom key→label overrides.' },
            { name: 'renderKey', type: '(props) => ReactNode', default: '—', description: 'Replace the default content renderer.' },
            { name: 'showTooltip / tooltip', type: 'boolean / string', default: '—', description: 'Optional tooltip on the key (Kbd).' },
            { name: 'shortcut (KbdShortcut)', type: 'string', default: '—', description: 'Shortcut string parsed into keys, e.g. "Ctrl+K".' },
          ]}
        />
      </section>
    </div>
  );
}
