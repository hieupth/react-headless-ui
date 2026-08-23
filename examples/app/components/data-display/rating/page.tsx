'use client';

import { useState } from 'react';
import { Rating } from '@hieupth/react-headless-ui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Rating renders a focusable container of star icons with full keyboard
// support (arrow keys, Home/End). Headless on CSS — color the icons via
// className / renderStar. The star glyphs here are plain text for clarity.
export default function RatingPage() {
  const [value, setValue] = useState(3);

  return (
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">Rating</h1>
        <p className="docs-lead">
          A star-rating input backed by the headless{' '}
          <code className="docs-code">useRating</code> hook. It supports{' '}
          <code>star</code>, <code>heart</code>, <code>thumbs</code>, and{' '}
          <code>custom</code> variants, fractional values via{' '}
          <code>allowHalf</code>, read-only and disabled states, hover preview,
          and full keyboard navigation. The icons ship as plain glyphs — color
          them through <code>className</code> or replace them with{' '}
          <code>renderStar</code>.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Controlled rating</h2>
        <p className="docs-desc">
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
  className="flex gap-1 text-2xl text-amber-500"
/>`}
        >
          <div className="flex flex-col items-center gap-2">
            <Rating value={value} onChange={setValue} showValue className="flex gap-1 text-2xl text-amber-500" />
            <span className="text-xs text-gray-500">Value: {value}</span>
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Half values &amp; read-only</h2>
        <p className="docs-desc">
          <code>allowHalf</code> enables fractional selection.{' '}
          <code>readonly</code> makes the rating display-only.
        </p>
        <Demo
          code={`<Rating defaultValue={3.5} allowHalf readonly className="flex gap-1 text-2xl text-amber-500" />`}
        >
          <Rating defaultValue={3.5} allowHalf readonly className="flex gap-1 text-2xl text-amber-500" />
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Heart variant</h2>
        <p className="docs-desc">
          Swap the glyph family with <code>variant</code>.
        </p>
        <Demo
          code={`<Rating defaultValue={4} variant="heart" className="flex gap-1 text-2xl text-rose-500" />`}
        >
          <Rating defaultValue={4} variant="heart" className="flex gap-1 text-2xl text-rose-500" />
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
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
