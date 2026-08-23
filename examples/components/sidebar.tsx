'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
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
    <nav aria-label="Documentation" className="app-sidebar">
      {sections.map((section) => {
        const isCollapsed = collapsed[section.title];
        // Stable per-section id so the disclosure button references its list
        // region (aria-controls ↔ id), letting assistive tech jump to it.
        const listId = `sidebar-section-${section.title.toLowerCase().replace(/\s+/g, '-')}`;
        return (
          <div key={section.title} className="app-sidebar-section">
            <button
              type="button"
              onClick={() => toggle(section.title)}
              className="app-sidebar-label"
              aria-expanded={!isCollapsed}
              aria-controls={listId}
            >
              <span>{section.title}</span>
              <span
                aria-hidden="true"
                className="app-sidebar-chevron"
                style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'none' }}
              >
                ▾
              </span>
            </button>
            <ul id={listId} className="app-sidebar-list" hidden={isCollapsed}>
              {section.links.map((link) => {
                  const active = isActive(pathname, link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`app-sidebar-link${active ? ' app-sidebar-link-active' : ''}`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
            </ul>
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

export default Sidebar;
