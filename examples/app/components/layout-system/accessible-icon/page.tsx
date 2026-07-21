'use client';

import { AccessibleIcon } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// AccessibleIcon is backed by the headless useAccessibleIcon hook. It wraps an
// icon in the correct ARIA: a meaningful icon gets role="img" + aria-label, a
// purely decorative one is aria-hidden. The hook also drives size, color, and
// rotation state and exposes focus/press behaviour when `interactive`. The
// default renderer accepts a Font Awesome class string OR a React element —
// these demos pass React elements so no icon-font CSS is required.

function StarSvg() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

function HeartSvg() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
      <path d="M12 21s-7.5-4.6-10-9.3C.6 8.3 2 5 5.2 5c1.9 0 3.3 1 4.8 3 1.5-2 2.9-3 4.8-3C21 5 22.4 8.3 22 11.7 19.5 16.4 12 21 12 21z" />
    </svg>
  );
}

export default function AccessibleIconPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">AccessibleIcon</h1>
        <p className="text-gray-600 dark:text-gray-400">
          An icon wrapper backed by the headless{' '}
          <code className="font-mono text-sm">useAccessibleIcon</code> hook that
          gets the ARIA right for you. A meaningful icon is announced via{' '}
          <code>role="img"</code> + <code>aria-label</code>; a purely decorative
          one is hidden from assistive tech with <code>aria-hidden</code>. The
          hook also owns size, color, and rotation state, and turns{' '}
          <code>interactive</code> icons into keyboard-operable targets. The
          default renderer takes a Font Awesome class string or a React element —
          these demos pass React elements so no icon-font CSS is needed.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Meaningful vs decorative</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The star is meaningful (it has a label screen readers announce); the
          heart is <code>decorative</code> and therefore <code>aria-hidden</code>.
          Inspect the markup to see the difference.
        </p>
        <Demo
          code={`<div className="flex items-center gap-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
  <AccessibleIcon icon={<StarSvg />} label="Favorite" size={32} color="#f59e0b" />
  <AccessibleIcon icon={<HeartSvg />} decorative size={32} color="#ef4444" />
</div>`}
        >
          <div className="flex items-center gap-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <AccessibleIcon
              icon={<StarSvg />}
              label="Favorite"
              size={32}
              color="#f59e0b"
            />
            <AccessibleIcon
              icon={<HeartSvg />}
              decorative
              size={32}
              color="#ef4444"
            />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Sizes &amp; colors</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>size</code> sets the font-size the icon inherits;{' '}
          <code>color</code> sets the foreground. Rotation state is also
          available via the hook&apos;s <code>rotate()</code> action.
        </p>
        <Demo
          code={`<div className="flex items-end gap-8 rounded-lg border border-gray-200 bg-white p-6 text-blue-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-blue-400">
  <AccessibleIcon icon={<StarSvg />} label="Small" size={16} color="#3b82f6" />
  <AccessibleIcon icon={<StarSvg />} label="Medium" size={28} color="#3b82f6" />
  <AccessibleIcon icon={<StarSvg />} label="Large" size={44} color="#3b82f6" />
</div>`}
        >
          <div className="flex items-end gap-8 rounded-lg border border-gray-200 bg-white p-6 text-blue-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-blue-400">
            <AccessibleIcon icon={<StarSvg />} label="Small star" size={16} color="#3b82f6" />
            <AccessibleIcon icon={<StarSvg />} label="Medium star" size={28} color="#3b82f6" />
            <AccessibleIcon icon={<StarSvg />} label="Large star" size={44} color="#3b82f6" />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Interactive</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Set <code>interactive</code> to make the icon focusable and operable —
          it gains <code>tabIndex</code> and fires <code>onClick</code> on Enter
          / Space, so an icon-only control stays keyboard accessible.
        </p>
        <Demo
          code={`<AccessibleIcon
  icon={<HeartSvg />}
  label="Like"
  size={28}
  color="#ef4444"
  interactive
  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-50 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:bg-red-950 dark:hover:bg-red-900"
  onClick={() => console.log('liked')}
/>`}
        >
          <AccessibleIcon
            icon={<HeartSvg />}
            label="Like"
            size={28}
            color="#ef4444"
            interactive
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-50 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:bg-red-950 dark:hover:bg-red-900"
            onClick={() => undefined}
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'icon', type: 'string | ReactNode', default: '—', description: 'Icon to render — a Font Awesome class string (e.g. "star") or a React element.' },
            { name: 'label', type: 'string', default: '—', description: 'Accessible label announced for non-decorative icons (role="img" + aria-label).' },
            { name: 'decorative', type: 'boolean', default: 'false', description: 'Mark the icon purely visual (aria-hidden, no label).' },
            { name: 'size', type: 'number', default: '16', description: 'Icon size in px (sets font-size on the wrapper).' },
            { name: 'color', type: 'string', default: "'currentColor'", description: 'Icon foreground color.' },
            { name: 'interactive', type: 'boolean', default: 'false', description: 'Make the icon focusable and fire onClick on Enter/Space.' },
            { name: 'rotation', type: 'number', default: '0', description: 'Initial rotation in degrees.' },
            { name: 'variant', type: "'solid' | 'outline' | 'duotone' | 'light'", default: "'solid'", description: 'Icon variant token (consumed by custom renderers).' },
            { name: 'renderIcon', type: '(icon, props) => ReactNode', default: '—', description: 'Custom icon renderer receiving the icon and computed props.' },
          ]}
        />
      </section>
    </div>
  );
}
