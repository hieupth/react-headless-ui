'use client';

import { useState } from 'react';
import { Rating } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Rating renders a focusable container of star icons with full keyboard
// support (arrow keys, Home/End). Headless on CSS — color the icons via
// className / renderStar. The star glyphs here are plain text for clarity.
export default function RatingPage() {
  const [value, setValue] = useState(3);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Rating</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A star-rating input backed by the headless{' '}
          <code className="font-mono text-sm">useRating</code> hook. It supports{' '}
          <code>star</code>, <code>heart</code>, <code>thumbs</code>, and{' '}
          <code>custom</code> variants, fractional values via{' '}
          <code>allowHalf</code>, read-only and disabled states, hover preview,
          and full keyboard navigation. The icons ship as plain glyphs — color
          them through <code>className</code> or replace them with{' '}
          <code>renderStar</code>.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Controlled rating</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Drive <code>value</code> with state and listen to{' '}
          <code>onChange</code>. <code>showValue</code> prints the number beside
          the stars.
        </p>
        <Demo
          code={`const [value, setValue] = useState(3);

<Rating
  value={value}
  onChange={setValue}
  showValue
/>`}
        >
          <div className="flex flex-col items-center gap-2 text-2xl text-amber-500">
            <Rating value={value} onChange={setValue} showValue className="text-amber-500" />
            <span className="text-xs text-gray-500">Value: {value}</span>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Half values &amp; read-only</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>allowHalf</code> enables fractional selection.{' '}
          <code>readonly</code> makes the rating display-only.
        </p>
        <Demo
          code={`<Rating defaultValue={3.5} allowHalf readonly />`}
        >
          <Rating defaultValue={3.5} allowHalf readonly className="text-2xl text-amber-500" />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Heart variant</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Swap the glyph family with <code>variant</code>.
        </p>
        <Demo
          code={`<Rating defaultValue={4} variant="heart" />`}
        >
          <Rating defaultValue={4} variant="heart" className="text-2xl text-rose-500" />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'value / defaultValue', type: 'number', default: '—', description: 'Controlled / initial rating value.' },
            { name: 'max', type: 'number', default: '5', description: 'Maximum rating.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Icon size.' },
            { name: 'variant', type: "'star' | 'heart' | 'thumbs' | 'custom'", default: "'star'", description: 'Glyph family.' },
            { name: 'allowHalf', type: 'boolean', default: 'false', description: 'Allow half-star values.' },
            { name: 'readonly', type: 'boolean', default: 'false', description: 'Display-only rating.' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable interaction.' },
            { name: 'allowClear', type: 'boolean', default: '—', description: 'Click the current value to reset to 0.' },
            { name: 'step', type: 'number', default: '—', description: 'Step size for value changes.' },
            { name: 'showValue', type: 'boolean', default: 'false', description: 'Render the numeric value next to the icons.' },
            { name: 'renderStar', type: '(props) => ReactNode', default: '—', description: 'Replace the default icon renderer.' },
            { name: 'onChange', type: '(value: number) => void', default: '—', description: 'Fires on selection.' },
          ]}
        />
      </section>
    </div>
  );
}
