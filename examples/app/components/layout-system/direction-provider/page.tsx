'use client';

import { useState } from 'react';
import {
  DirectionProvider,
  DirectionalText,
  DirectionalFlex,
  DirectionToggle,
  type DirectionProviderProps,
} from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// DirectionProvider is backed by the headless useDirectionProvider hook. It
// manages text/layout direction (LTR/RTL/auto) for internationalization,
// exposes it through DirectionContext, and ships directional helpers
// (DirectionalText, DirectionalFlex, DirectionalSpacer, DirectionToggle) that
// mirror their layout when the direction flips. It can also write the `dir` /
// `lang` attributes onto <html> and auto-detect direction from a locale or text.

export default function DirectionProviderPage() {
  const [dir, setDir] =
    useState<DirectionProviderProps['defaultTextDirection']>('ltr');

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">DirectionProvider</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A direction context backed by the headless{' '}
          <code className="font-mono text-sm">useDirectionProvider</code> hook.
          It manages text and layout direction —{' '}
          <code>ltr</code>, <code>rtl</code>, or <code>auto</code> — for
          internationalized UIs, publishes it via{' '}
          <code>DirectionContext</code>, and ships directional helpers:{' '}
          <code>DirectionalText</code>, <code>DirectionalFlex</code>,{' '}
          <code>DirectionalSpacer</code>, and a <code>DirectionToggle</code>{' '}
          button. It can sync the document&apos;s <code>dir</code> /{' '}
          <code>lang</code> attributes and auto-detect direction from a locale or
          the text content itself.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Toggle LTR ↔ RTL</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A provider wraps a small card. The{' '}
          <code>DirectionToggle</code> flips the whole subtree;{' '}
          <code>DirectionalFlex</code> reverses its row order and{' '}
          <code>DirectionalText</code> re-aligns. Switch direction to watch the
          layout mirror.
        </p>
        <Demo
          code={`<DirectionProvider defaultTextDirection="ltr">
  <div className="w-full space-y-4">
    <DirectionToggle className="px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-200" />
    <DirectionalFlex gap="12px" className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
      <span className="rounded bg-blue-600 px-3 py-1 text-sm text-white">
        <DirectionalText>First</DirectionalText>
      </span>
      <span className="rounded bg-blue-500 px-3 py-1 text-sm text-white">
        <DirectionalText>Second</DirectionalText>
      </span>
      <span className="rounded bg-blue-400 px-3 py-1 text-sm text-white">
        <DirectionalText>Third</DirectionalText>
      </span>
    </DirectionalFlex>
  </div>
</DirectionProvider>`}
        >
          <DirectionProvider defaultTextDirection={dir}>
            <div className="w-full space-y-4">
              <DirectionToggle className="px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800" />
              <DirectionalFlex
                gap="12px"
                className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <span className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white">
                  <DirectionalText>First</DirectionalText>
                </span>
                <span className="rounded bg-blue-500 px-3 py-1 text-sm font-medium text-white">
                  <DirectionalText>Second</DirectionalText>
                </span>
                <span className="rounded bg-blue-400 px-3 py-1 text-sm font-medium text-white">
                  <DirectionalText>Third</DirectionalText>
                </span>
              </DirectionalFlex>
            </div>
          </DirectionProvider>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDir('ltr')}
              className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              reset to LTR
            </button>
            <button
              type="button"
              onClick={() => setDir('rtl')}
              className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              reset to RTL
            </button>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Auto-detect from locale</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          With <code>textDirection="auto"</code> and{' '}
          <code>autoDetectFromLocale</code>, the provider picks the direction
          from the locale — Arabic (<code>ar</code>), Hebrew (<code>he</code>),
          Persian (<code>fa</code>), and Urdu (<code>ur</code>) resolve to RTL.
        </p>
        <Demo
          code={`<DirectionProvider textDirection="auto" locale="ar" autoDetectFromLocale>
  <div className="rounded-md border border-gray-200 bg-white p-4 text-lg text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
    <DirectionalText>مرحبا بالعالم — Hello world</DirectionalText>
  </div>
</DirectionProvider>`}
        >
          <DirectionProvider
            textDirection="auto"
            defaultLocale="ar"
            autoDetectFromLocale
          >
            <div className="rounded-md border border-gray-200 bg-white p-4 text-lg text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
              <DirectionalText>مرحبا بالعالم — Hello world</DirectionalText>
            </div>
          </DirectionProvider>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'defaultTextDirection', type: "'ltr' | 'rtl' | 'auto'", default: "'ltr'", description: 'Uncontrolled initial text direction.' },
            { name: 'textDirection', type: "'ltr' | 'rtl' | 'auto'", default: '—', description: 'Controlled text direction.' },
            { name: 'defaultLayoutDirection', type: "'ltr' | 'rtl'", default: "'ltr'", description: 'Uncontrolled initial layout direction.' },
            { name: 'defaultLocale', type: 'string', default: "'en'", description: 'Initial locale (BCP-47); used for dir/lang detection.' },
            { name: 'autoDetectFromLocale', type: 'boolean', default: 'true', description: 'Derive direction from the locale (ar/he/fa/ur → rtl).' },
            { name: 'syncDirections', type: 'boolean', default: 'true', description: 'Keep text and layout direction in lockstep.' },
            { name: 'updateHTMLDir', type: 'boolean', default: 'true', description: 'Mirror the resolved direction onto document.documentElement.dir.' },
            { name: 'updateHTMLLang', type: 'boolean', default: 'true', description: 'Mirror the locale onto document.documentElement.lang.' },
            { name: 'rtlLocales', type: 'string[]', default: 'built-in list', description: 'Custom list of locale codes treated as RTL.' },
            { name: 'onDirectionChange', type: '(textDir, layoutDir) => void', default: '—', description: 'Fires whenever the resolved direction changes.' },
            { name: 'as', type: 'ElementType', default: "'div'", description: 'Element tag for the provider wrapper.' },
          ]}
        />
      </section>
    </div>
  );
}
