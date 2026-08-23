'use client';

import { useState } from 'react';
import { Pagination, CompactPagination } from '@hieupth/react-headless-ui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Pagination renders real <button>s with ARIA labels and aria-current="page".
// It is headless on styling — theme the nav container via the `className` prop.
const paginationCls =
  'flex items-center gap-1 text-sm';
const compactCls =
  'flex items-center gap-2 text-sm';

export default function PaginationPage() {
  const [page, setPage] = useState(3);

  return (
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">Pagination</h1>
        <p className="docs-lead">
          Page navigation backed by the headless{' '}
          <code className="docs-code">usePagination</code> hook. It emits
          first / prev / numbered / next / last buttons with{' '}
          <code>aria-current="page"</code>, ellipsis at <code>siblingCount</code>
          boundaries, and full keyboard support. The default renderer ships the
          ARIA structure — apply your own button styles.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Controlled paging</h2>
        <p className="docs-desc">
          Drive <code>page</code> with state and listen to{' '}
          <code>onPageChange</code>. <code>totalPages</code> is required;{' '}
          <code>siblingCount</code> controls how many numbers flank the current
          page before ellipsis appears.
        </p>
        <Demo
          code={`<Pagination
  className="flex items-center gap-1 text-sm"
  page={page}
  totalPages={10}
  siblingCount={1}
  onPageChange={setPage}
/>`}
        >
          <div className="flex flex-col items-center gap-3">
            <Pagination className={paginationCls} page={page} totalPages={10} siblingCount={1} onPageChange={setPage} />
            <span className="text-xs text-gray-500">Current page: {page}</span>
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Compact variant</h2>
        <p className="docs-desc">
          <code>CompactPagination</code> shows only prev / next with a{' '}
          <em>page X of N</em> label — ideal for tight toolbars. Use{' '}
          <code>defaultPage</code> for an uncontrolled control.
        </p>
        <Demo
          code={`<CompactPagination
  className="flex items-center gap-2 text-sm"
  defaultPage={1}
  totalPages={5}
/>`}
        >
          <CompactPagination className={compactCls} defaultPage={1} totalPages={5} />
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
        <PropsTable
          props={[
            {
              name: 'page / defaultPage',
              type: 'number',
              default: '—',
              description: 'Controlled / uncontrolled current page (1-based).',
            },
            {
              name: 'totalPages',
              type: 'number',
              default: '—',
              description: 'Total number of pages (required).',
            },
            {
              name: 'itemsPerPage',
              type: 'number',
              default: '—',
              description: 'Items per page (informational; pairs with total counts).',
            },
            {
              name: 'siblingCount',
              type: 'number',
              default: '1',
              description: 'Page numbers shown on each side of the current before ellipsis.',
            },
            {
              name: 'showPageNumbers',
              type: 'boolean',
              default: 'true',
              description: 'Whether to render the numbered page buttons.',
            },
            {
              name: 'showFirstLast',
              type: 'boolean',
              default: '—',
              description: 'Show first/last jump buttons.',
            },
            {
              name: 'onPageChange',
              type: '(page: number) => void',
              default: '—',
              description: 'Fires on any navigation (number, prev/next, first/last).',
            },
            {
              name: 'size / variant',
              type: "'sm'|'md'|'lg' / 'default'|'outline'|'ghost'",
              default: "'md' / 'default'",
              description: 'Density and visual variant hooks.',
            },
          ]}
        />
      </section>
    </div>
  );
}
