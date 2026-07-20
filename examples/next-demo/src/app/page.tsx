/**
 * Example app index page with links to all component categories.
 * Following CLAUDE.md requirements: Index page lists all categories.
 */

import Link from 'next/link';

export default function IndexPage() {
  const categories = [
    {
      title: 'Buttons',
      description: 'Interactive button components for user actions',
      href: '/buttons',
      components: ['Button', 'Button Group', 'Icon Button', 'Loading Button', 'Toggle Button'],
      color: 'blue'
    },
    {
      title: 'Navigation',
      description: 'Navigation components for menus, breadcrumbs, and user flow',
      href: '/navigation',
      components: ['Accordion', 'Accordion Menu', 'Breadcrumb', 'Dropdown Menu', 'Menu', 'Navigation Menu', 'Tabs', 'Command', 'Combobox', 'Context Menu'],
      color: 'blue'
    },
    {
      title: 'Forms & Inputs',
      description: 'Form controls and input components for data collection',
      href: '/inputs',
      components: ['Button', 'Button Group', 'Input', 'Textarea', 'Checkbox', 'Switch', 'Slider', 'Select', 'Label', 'Field', 'Calendar'],
      color: 'green'
    },
    {
      title: 'Data Display',
      description: 'Components for displaying and presenting data',
      href: '/data-display',
      components: ['Avatar', 'Badge', 'Card', 'Carousel', 'Chart', 'Data Grid', 'Skeleton', 'Table', 'Typography'],
      color: 'purple'
    },
    {
      title: 'Feedback',
      description: 'Alerts, dialogs, and notification components',
      href: '/feedback',
      components: ['Alert', 'Alert Dialog', 'Dialog', 'Drawer', 'Hover Card', 'Popover', 'Progress', 'Spinner', 'Tooltip'],
      color: 'red'
    },
    {
      title: 'Layout',
      description: 'Layout and structural components',
      href: '/layout',
      components: ['Aspect Ratio', 'Collapsible', 'Offcanvas', 'Panel', 'Resizable', 'Scroll Area', 'Sidebar', 'Separator'],
      color: 'yellow'
    },
    {
      title: 'Advanced',
      description: 'Advanced and specialized components',
      href: '/advanced',
      components: ['File Upload', 'Drag & Drop', 'Sortable', 'Stepper', 'Sticky Toolbar'],
      color: 'indigo'
    },
    {
      title: 'Utilities',
      description: 'Utility and helper components',
      href: '/utilities',
      components: ['Accessible Icon', 'Direction Provider', 'Item', 'Kbd', 'Portal', 'Slot', 'Visually Hidden'],
      color: 'gray'
    },
    {
      title: 'Pagination',
      description: 'Pagination and navigation components',
      href: '/pagination',
      components: ['Pagination'],
      color: 'orange'
    },
    {
      title: 'Interactive',
      description: 'Interactive and control components',
      href: '/interactive',
      components: ['Toggle', 'Toggle Group'],
      color: 'pink'
    },
    {
      title: 'Motion',
      description: 'Animation and motion components',
      href: '/motion',
      components: ['Fade In/Out', 'Slide In', 'Scale In/Out', 'Rotate In', 'Bounce', 'Shake', 'Pulse', 'Flip', 'Blur In/Out', 'Stagger Children', 'Parallax Scroll', 'Reveal on Scroll', 'Hover Lift', 'Magnetic Hover'],
      color: 'teal'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 hover:border-blue-300',
    green: 'bg-green-50 border-green-200 hover:border-green-300',
    purple: 'bg-purple-50 border-purple-200 hover:border-purple-300',
    red: 'bg-red-50 border-red-200 hover:border-red-300',
    yellow: 'bg-yellow-50 border-yellow-200 hover:border-yellow-300',
    indigo: 'bg-indigo-50 border-indigo-200 hover:border-indigo-300',
    gray: 'bg-gray-50 border-gray-200 hover:border-gray-300',
    orange: 'bg-orange-50 border-orange-200 hover:border-orange-300',
    pink: 'bg-pink-50 border-pink-200 hover:border-pink-300',
    teal: 'bg-teal-50 border-teal-200 hover:border-teal-300'
  };

  const badgeColorClasses = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    gray: 'bg-gray-100 text-gray-700',
    orange: 'bg-orange-100 text-orange-700',
    pink: 'bg-pink-100 text-pink-700',
    teal: 'bg-teal-100 text-teal-700'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            React UI Forge - Component Library
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Flutter-inspired headless UI library for React. Built with composition,
            mixins, and semantic-first design patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className={`block p-6 bg-white rounded-lg shadow-sm border transition-all duration-200 ${colorClasses[category.color as keyof typeof colorClasses]}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  {category.title}
                </h2>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              <p className="text-gray-600 mb-4">
                {category.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-3">
                {category.components.slice(0, 5).map((component) => (
                  <span
                    key={component}
                    className={`px-2 py-1 text-xs rounded ${badgeColorClasses[category.color as keyof typeof badgeColorClasses]}`}
                  >
                    {component}
                  </span>
                ))}
                {category.components.length > 5 && (
                  <span className="px-2 py-1 text-xs text-gray-500 rounded">
                    +{category.components.length - 5} more
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-500">
                {category.components.length} component{category.components.length !== 1 ? 's' : ''}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-4">
            All components follow Flutter-inspired patterns with composition over inheritance.
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-400">
            <div>Total Categories: {categories.length}</div>
            <div>Total Components: {categories.reduce((acc, cat) => acc + cat.components.length, 0)}+</div>
            <div>Build Status: ✅ Working</div>
          </div>
        </div>
      </div>
    </div>
  );
}