'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import {
  componentCategories,
  getComponentsByCategory,
} from '@/lib/component-meta';

interface SidebarSection {
  title: string;
  links: { label: string; href: string }[];
}

/** Build static + component-driven nav sections. */
function buildSections(): SidebarSection[] {
  const sections: SidebarSection[] = [
    {
      title: 'Getting Started',
      links: [
        { label: 'Introduction', href: '/' },
        { label: 'Installation', href: '/docs/getting-started/' },
      ],
    },
    {
      title: 'Theming',
      links: [{ label: 'Dark Mode', href: '/docs/theming/' }],
    },
  ];

  for (const category of componentCategories) {
    sections.push({
      title: category,
      links: getComponentsByCategory(category).map((c) => ({
        label: c.name,
        href: `/components/${c.categoryFolder}/${c.slug}/`,
      })),
    });
  }

  return sections;
}

/**
 * Showcase navigation sidebar. Renders Getting Started, Theming, and
 * every component category. Sections are collapsible; the active link
 * is highlighted via usePathname.
 */
export function Sidebar() {
  const pathname = usePathname();
  const sections = buildSections();

  // Default all sections open; track collapsed state by title.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = (title: string) =>
    setCollapsed((c) => ({ ...c, [title]: !c[title] }));

  return (
    <nav
      aria-label="Documentation"
      className="h-full w-64 shrink-0 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-4"
    >
      {sections.map((section) => {
        const isCollapsed = collapsed[section.title];
        return (
          <div key={section.title} className="mb-4">
            <button
              type="button"
              onClick={() => toggle(section.title)}
              className="flex w-full items-center justify-between px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              aria-expanded={!isCollapsed}
            >
              <span>{section.title}</span>
              <span aria-hidden="true" className="transition-transform" style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'none' }}>
                ▾
              </span>
            </button>
            {!isCollapsed && (
              <ul className="mt-1 space-y-0.5">
                {section.links.map((link) => {
                  const active = isActive(pathname, link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                          active
                            ? 'bg-gray-100 dark:bg-gray-800 font-medium text-gray-900 dark:text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}

/** A link is active when the pathname matches its href (trailing-slash safe). */
function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  const norm = (p: string) => p.replace(/\/+$/, '') || '/';
  return norm(pathname) === norm(href);
}

/** Convenience wrapper for layout composition. */
export function SidebarLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

export default Sidebar;
