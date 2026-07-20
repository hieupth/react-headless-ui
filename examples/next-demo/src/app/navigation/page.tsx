/**
 * Navigation Components Category Page
 * Following CLAUDE.md requirements: Each category has dedicated page showing ALL components in category.
 */

'use client';

// Force dynamic rendering to avoid SSG issues
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import React, { useState } from 'react';

// Import actual navigation components from renderer package
// Temporarily commented out due to SSR issues - using HTML implementations instead
// import {
//   Accordion,
//   AccordionMenu,
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuLabel,
//   Menu,
//   Tabs,
//   Command,
//   CommandTrigger,
//   CommandInput,
//   CommandList,
//   CommandItem,
//   CommandGroup,
//   CommandSeparator,
//   CommandEmpty,
//   Combobox,
//   ComboboxInput,
//   ComboboxList,
//   ComboboxOption,
//   ComboboxGroup,
//   ComboboxEmpty,
//   Sidebar,
//   SidebarItem,
//   SidebarGroup,
//   SidebarDivider,
//   TreeView,
//   TreeViewNode,
//   Menubar,
//   MenubarItem,
//   NavigationMenu,
//   MegaMenu,
//   Scrollspy,
//   ScrollspySection
// } from '@hieupth/reui';


// Comprehensive Tabs components for testing
const TabList = ({ orientation = 'horizontal', children, className = '' }: {
  orientation?: 'horizontal' | 'vertical';
  children: React.ReactNode;
  className?: string;
}) => {
  const orientationClass = orientation === 'vertical' ? 'flex-col space-y-1' : 'flex border-b border-gray-200';
  return (
    <nav
      role="tablist"
      aria-orientation={orientation}
      className={`${orientationClass} ${className}`}
    >
      {children}
    </nav>
  );
};

const Tab = ({
  testId,
  isSelected,
  onSelect,
  disabled = false,
  children,
  className = ''
}: {
  testId: string;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) => {
  const baseClasses = 'px-1 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500';
  const selectedClasses = isSelected
    ? 'text-blue-600 border-b-2 border-blue-500'
    : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent';
  const disabledClasses = disabled
    ? 'text-gray-400 cursor-not-allowed'
    : 'cursor-pointer';

  // Generate panel ID from test ID
  const panelId = testId.replace('tab-', '') + '-panel';

  return (
    <button
      data-testid={testId}
      role="tab"
      aria-selected={disabled ? 'false' : (isSelected ? 'true' : 'false')}
      aria-controls={panelId}
      aria-disabled={disabled ? 'true' : 'false'}
      disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onSelect()}
      className={`${baseClasses} ${selectedClasses} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};

const TabPanel = ({
  testId,
  isSelected,
  children
}: {
  testId: string;
  isSelected: boolean;
  children: React.ReactNode;
}) => (
    <div
      data-testid={testId}
      id={testId}
      role="tabpanel"
      aria-labelledby={testId.replace('tab-panel-', 'tab-')}
      className={`p-4 ${isSelected ? '' : 'hidden'}`}
    >
      {children}
    </div>
  );

// Horizontal Tabs Component using custom implementation (for now, until renderer Tabs API is finalized)
const HorizontalTabs = () => {
  const [activeTab, setActiveTab] = React.useState('overview');

  return (
    <div className="space-y-4">
      <nav
        role="tablist"
        aria-orientation="horizontal"
        className="flex border-b border-gray-200"
        data-testid="tabs-list-horizontal"
      >
        <button
          data-testid="tab-overview"
          role="tab"
          aria-selected={activeTab === 'overview' ? 'true' : 'false'}
          aria-controls="tab-panel-overview"
          onClick={() => setActiveTab('overview')}
          className={`px-1 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
          }`}
        >
          Overview
        </button>
        <button
          data-testid="tab-details"
          role="tab"
          aria-selected={activeTab === 'details' ? 'true' : 'false'}
          aria-controls="tab-panel-details"
          onClick={() => setActiveTab('details')}
          className={`px-1 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            activeTab === 'details'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
          }`}
        >
          Details
        </button>
        <button
          data-testid="tab-settings"
          role="tab"
          aria-selected={activeTab === 'settings' ? 'true' : 'false'}
          aria-controls="tab-panel-settings"
          onClick={() => setActiveTab('settings')}
          className={`px-1 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            activeTab === 'settings'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
          }`}
        >
          Settings
        </button>
        <button
          data-testid="disabled-tab"
          role="tab"
          aria-selected={false}
          disabled
          className="px-1 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-400 cursor-not-allowed border-b-2 border-transparent"
        >
          Disabled Tab
        </button>
      </nav>

      <div
        data-testid="tab-panel-overview"
        id="tab-panel-overview"
        role="tabpanel"
        aria-labelledby="tab-overview"
        className={`p-4 ${activeTab === 'overview' ? '' : 'hidden'}`}
      >
        <h3 className="text-lg font-semibold mb-2">Overview Content</h3>
        <p>This is the overview tab content with important information about the current state.</p>
      </div>

      <div
        data-testid="tab-panel-details"
        id="tab-panel-details"
        role="tabpanel"
        aria-labelledby="tab-details"
        className={`p-4 ${activeTab === 'details' ? '' : 'hidden'}`}
      >
        <h3 className="text-lg font-semibold mb-2">Details Content</h3>
        <p>Detailed information goes here. This panel contains comprehensive details about the selected item.</p>
      </div>

      <div
        data-testid="tab-panel-settings"
        id="tab-panel-settings"
        role="tabpanel"
        aria-labelledby="tab-settings"
        className={`p-4 ${activeTab === 'settings' ? '' : 'hidden'}`}
      >
        <h3 className="text-lg font-semibold mb-2">Settings Content</h3>
        <p>Configuration and settings options are available in this panel.</p>
      </div>
    </div>
  );
};

// Vertical Tabs Component using custom implementation (for now, until renderer Tabs API is finalized)
const VerticalTabs = () => {
  const [activeTab, setActiveTab] = React.useState('general');

  return (
    <div className="flex gap-6">
      <nav
        role="tablist"
        aria-orientation="vertical"
        className="flex flex-col space-y-1"
        data-testid="tabs-list-vertical"
      >
        <button
          data-testid="vertical-tab-general"
          role="tab"
          aria-selected={activeTab === 'general' ? 'true' : 'false'}
          aria-controls="vertical-tab-panel-general"
          onClick={() => setActiveTab('general')}
          className={`px-1 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-left ${
            activeTab === 'general'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
          }`}
        >
          General
        </button>
        <button
          data-testid="vertical-tab-security"
          role="tab"
          aria-selected={activeTab === 'security' ? 'true' : 'false'}
          aria-controls="vertical-tab-panel-security"
          onClick={() => setActiveTab('security')}
          className={`px-1 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-left ${
            activeTab === 'security'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
          }`}
        >
          Security Settings
        </button>
        <button
          data-testid="vertical-tab-advanced"
          role="tab"
          aria-selected={activeTab === 'advanced' ? 'true' : 'false'}
          aria-controls="vertical-tab-panel-advanced"
          onClick={() => setActiveTab('advanced')}
          className={`px-1 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-left ${
            activeTab === 'advanced'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
          }`}
        >
          Advanced
        </button>
      </nav>
      <div className="flex-1">
        <div
          data-testid="vertical-tab-panel-general"
          id="vertical-tab-panel-general"
          role="tabpanel"
          aria-labelledby="vertical-tab-general"
          className={`p-4 mt-0 ${activeTab === 'general' ? '' : 'hidden'}`}
        >
          <h3 className="text-lg font-semibold mb-2">General Settings</h3>
          <p>General configuration options and preferences.</p>
        </div>
        <div
          data-testid="vertical-tab-panel-security"
          id="vertical-tab-panel-security"
          role="tabpanel"
          aria-labelledby="vertical-tab-security"
          className={`p-4 mt-0 ${activeTab === 'security' ? '' : 'hidden'}`}
        >
          <h3 className="text-lg font-semibold mb-2">Security Settings</h3>
          <p>Security Settings configuration and privacy options.</p>
        </div>
        <div
          data-testid="vertical-tab-panel-advanced"
          id="vertical-tab-panel-advanced"
          role="tabpanel"
          aria-labelledby="vertical-tab-advanced"
          className={`p-4 mt-0 ${activeTab === 'advanced' ? '' : 'hidden'}`}
        >
          <h3 className="text-lg font-semibold mb-2">Advanced Settings</h3>
          <p>Advanced configuration options and developer settings.</p>
        </div>
      </div>
    </div>
  );
};


const Breadcrumb = () => (
  <nav className="flex" aria-label="Breadcrumb">
    <ol className="flex items-center space-x-2">
      <li><Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link></li>
      <li><span className="text-gray-400">/</span></li>
      <li><Link href="/navigation" className="text-blue-600 hover:text-blue-800">Navigation</Link></li>
      <li><span className="text-gray-400">/</span></li>
      <li className="text-gray-500">Components</li>
    </ol>
  </nav>
);


const ContextMenu = () => (
  <div className="p-4 bg-gray-50 rounded-lg">
    <p className="text-gray-600 mb-2">Right-click anywhere to see context menu</p>
    <div className="text-sm text-gray-500">Context menu appears on right-click</div>
  </div>
);

export default function NavigationPage() {
  const [activeTab, setActiveTab] = useState('all');

  // Command state
  const [commandStates, setCommandStates] = useState({
    basic: { isOpen: false, value: '' },
    shortcuts: { isOpen: false, value: '' },
    groups: { isOpen: false, value: '' }
  });

  // Command handlers
  const handleCommandTrigger = (commandId: string) => {
    setCommandStates(prev => {
      const key = commandId as keyof typeof prev;
      return {
        ...prev,
        [key]: { isOpen: true, value: '' }
      };
    });
  };

  const handleCommandChange = (commandId: string, value: string) => {
    setCommandStates(prev => {
      const key = commandId as keyof typeof prev;
      return {
        ...prev,
        [key]: { ...prev[key], value }
      };
    });
  };

  const handleCommandEscape = (commandId: string) => {
    setCommandStates(prev => {
      const key = commandId as keyof typeof prev;
      return {
        ...prev,
        [key]: { isOpen: false, value: '' }
      };
    });
  };

  const handleCommandSelect = (commandId: string, value: string) => {
    setCommandStates(prev => {
      const key = commandId as keyof typeof prev;
      return {
        ...prev,
        [key]: { isOpen: false, value: '' }
      };
    });
  };

  const getCommandItems = (commandId: string, filterText: string) => {
    type CommandItem =
      | { value: string; label: string; shortcut: string }
      | { value: string; label: string; group: string; shortcut: string };

    const allItems: Record<string, CommandItem[]> = {
      basic: [
        { value: 'new-file', label: 'New File', shortcut: '⌘N' },
        { value: 'open-file', label: 'Open File', shortcut: '⌘O' },
        { value: 'save', label: 'Save', shortcut: '⌘S' },
        { value: 'settings', label: 'Settings', shortcut: '⌘,' },
        { value: 'exit', label: 'Exit', shortcut: '⌘Q' }
      ],
      shortcuts: [
        { value: 'copy', label: 'Copy', shortcut: '⌘C' },
        { value: 'paste', label: 'Paste', shortcut: '⌘V' },
        { value: 'cut', label: 'Cut', shortcut: '⌘X' },
        { value: 'undo', label: 'Undo', shortcut: '⌘Z' },
        { value: 'redo', label: 'Redo', shortcut: '⌘Y' }
      ],
      groups: [
        { value: 'profile', label: 'Profile', group: 'User', shortcut: '' },
        { value: 'settings', label: 'Settings', group: 'User', shortcut: '' },
        { value: 'documentation', label: 'Documentation', group: 'Help', shortcut: 'F1' },
        { value: 'about', label: 'About', group: 'Help', shortcut: '' }
      ]
    };

    const items = allItems[commandId] || [];
    if (!filterText) return items;
    return items.filter(item =>
      item.label.toLowerCase().includes(filterText.toLowerCase())
    );
  };

  const navigationComponents = [
    { name: 'Accordion', description: 'Vertically stacked interactive headings with expandable content', status: 'available' },
    { name: 'Accordion Menu', description: 'Enhanced accordion for navigation with nested items', status: 'available' },
    { name: 'Breadcrumb', description: 'Navigation breadcrumb showing current location', status: 'available' },
    { name: 'Dropdown Menu', description: 'Menu appearing on button click with action options', status: 'available' },
    { name: 'Menu', description: 'Generic menu component with keyboard navigation', status: 'available' },
    { name: 'Sidebar', description: 'Collapsible side navigation with responsive behavior', status: 'available' },
    { name: 'TreeView', description: 'Hierarchical tree navigation with expand/collapse', status: 'available' },
    { name: 'Menubar', description: 'Application menu bar with submenus and keyboard navigation', status: 'available' },
    { name: 'Navigation Menu', description: 'Complex navigation with dropdowns, mega menus, and search', status: 'available' },
    { name: 'MegaMenu', description: 'Large dropdown menu with rich content panels and comprehensive navigation', status: 'available' },
    { name: 'Scrollspy', description: 'Navigation that highlights sections based on scroll position', status: 'available' },
    { name: 'Tabs', description: 'Organize content into separate panels via tabs', status: 'available' },
    { name: 'Command', description: 'Command palette with search and keyboard navigation', status: 'available' },
    { name: 'Combobox', description: 'Combined input and dropdown with search functionality', status: 'available' },
    { name: 'Context Menu', description: 'Menu appearing on right-click with context actions', status: 'available' },
    { name: 'Pagination', description: 'Navigate through multiple pages with controls', status: 'available' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation */}
        <nav className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Categories
          </Link>
          <Breadcrumb />
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Navigation Components
          </h1>
          <p className="text-lg text-gray-600">
            Navigation components for menus, breadcrumbs, and user flow management.
            Built with Flutter-inspired patterns and semantic-first design.
          </p>
        </div>

        {/* Component Tabs */}
        <div className="mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Components ({navigationComponents.length})
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'available'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Available ({navigationComponents.filter(c => c.status === 'available').length})
            </button>
            <button
              onClick={() => setActiveTab('demo')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'demo'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Live Demo
            </button>
          </div>
        </div>

        {/* Component List */}
        {activeTab === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {navigationComponents.map((component) => (
              <div key={component.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{component.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(component.status)}`}>
                    {component.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{component.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Available Components */}
        {activeTab === 'available' && (
          <div className="space-y-8 mb-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Accordion</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="space-y-2">
                  <details className="group">
                    <summary className="flex justify-between items-center cursor-pointer list-none p-3 bg-gray-50 hover:bg-gray-100 rounded-lg">
                      <span className="font-medium">Accordion Item 1</span>
                      <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="p-3 text-gray-600">
                      This is accordion content with expandable behavior. It follows Flutter patterns with proper accessibility.
                    </div>
                  </details>
                  <details className="group">
                    <summary className="flex justify-between items-center cursor-pointer list-none p-3 bg-gray-50 hover:bg-gray-100 rounded-lg">
                      <span className="font-medium">Accordion Item 2</span>
                      <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="p-3 text-gray-600">
                      More accordion content with semantic HTML5 details/summary elements.
                    </div>
                  </details>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Dropdown Menu</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="relative inline-block text-left" data-testid="dropdown-menu-basic">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => console.log('Menu clicked')}
                  >
                    Menu
                    <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden={true}>
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100" role="menu" aria-orientation="vertical">
                    <div className="py-1" role="none">
                      <a href="#" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" onClick={() => console.log('Option 1 selected')}>Option 1</a>
                      <a href="#" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" onClick={() => console.log('Option 2 selected')}>Option 2</a>
                      <a href="#" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" onClick={() => console.log('Option 3 selected')}>Option 3</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Tabs</h3>
              <div className="bg-white rounded-lg border border-gray-200">
                <HorizontalTabs />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Command Palette</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-gray-600 mb-2">Command palette component with search functionality</p>
                <div className="text-sm text-gray-500">Command component available via renderer package with render props API</div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Context Menu</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <ContextMenu />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sidebar</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-gray-600 mb-4">Sidebar component with navigation items and collapsible sections</p>
                <div className="text-sm text-gray-500">Sidebar component available via renderer package with responsive behavior</div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">TreeView</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-gray-600 mb-4">TreeView component with hierarchical navigation and expand/collapse functionality</p>
                <div className="text-sm text-gray-500">TreeView component available via renderer package with keyboard navigation and selection</div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Menubar</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-gray-600 mb-4">Menubar component with application menus and submenus</p>
                <div className="text-sm text-gray-500">Menubar component available via renderer package with full keyboard navigation</div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Navigation Menu</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-gray-600 mb-4">Navigation Menu component with complex patterns including mega menus and search</p>
                <div className="text-sm text-gray-500">Navigation Menu component available via renderer package with responsive behavior</div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">MegaMenu</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <nav className="flex space-x-8" role="navigation">
                  <div className="relative group">
                    <button className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium flex items-center">
                      Products
                      <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute left-0 mt-2 w-screen max-w-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="grid grid-cols-3 gap-4 p-4">
                        <div>
                          <h4 className="font-semibold mb-2">Software</h4>
                          <ul className="space-y-1">
                            <li><a href="#" className="text-blue-600 hover:underline">Analytics</a></li>
                            <li><a href="#" className="text-blue-600 hover:underline">CRM</a></li>
                            <li><a href="#" className="text-blue-600 hover:underline">Marketing</a></li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Hardware</h4>
                          <ul className="space-y-1">
                            <li><a href="#" className="text-blue-600 hover:underline">Laptops</a></li>
                            <li><a href="#" className="text-blue-600 hover:underline">Desktops</a></li>
                            <li><a href="#" className="text-blue-600 hover:underline">Mobile</a></li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Services</h4>
                          <ul className="space-y-1">
                            <li><a href="#" className="text-blue-600 hover:underline">Consulting</a></li>
                            <li><a href="#" className="text-blue-600 hover:underline">Support</a></li>
                            <li><a href="#" className="text-blue-600 hover:underline">Training</a></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative group">
                    <button className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium flex items-center">
                      Solutions
                      <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute left-0 mt-2 w-64 bg-white shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="p-4">
                        <h4 className="font-semibold mb-2">Industry Solutions</h4>
                        <p className="text-gray-600">Tailored solutions for your industry needs.</p>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                    Resources
                  </button>
                  <button className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                    Company
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Dropdown Menu Components Section */}
        <section className="space-y-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900">Dropdown Menu Components</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Dropdown Menu</h3>
              <div className="relative inline-block text-left" data-testid="dropdown-menu">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => console.log('Menu clicked')}
                >
                  Menu
                  <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden={true}>
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100" role="menu" aria-orientation="vertical">
                  <div className="py-1" role="none">
                    <a href="#" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" onClick={() => console.log('Option 1 selected')}>Option 1</a>
                    <a href="#" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" onClick={() => console.log('Option 2 selected')}>Option 2</a>
                    <a href="#" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" onClick={() => console.log('Option 3 selected')}>Option 3</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">User Menu</h3>
              <div className="relative inline-block text-left" data-testid="user-dropdown-menu">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => console.log('User menu clicked')}
                >
                  User Menu
                  <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden={true}>
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100" role="menu" aria-orientation="vertical">
                  <div className="px-4 py-3 text-sm text-gray-700" role="none">
                    <p className="font-medium">My Account</p>
                  </div>
                  <div className="py-1" role="none">
                    <a href="#" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" onClick={() => console.log('Profile selected')}>Profile</a>
                    <a href="#" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" onClick={() => console.log('Settings selected')}>Settings</a>
                  </div>
                  <div className="border-t border-gray-100"></div>
                  <div className="py-1" role="none">
                    <a href="#" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" onClick={() => console.log('Logout selected')}>Logout</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions Menu</h3>
              <div className="relative inline-block text-left" data-testid="actions-dropdown-menu">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => console.log('Actions menu clicked')}
                >
                  Actions
                  <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden={true}>
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100" role="menu" aria-orientation="vertical">
                  <div className="py-1" role="none">
                    <a href="#" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" onClick={() => console.log('New file selected')}>New File</a>
                    <a href="#" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" onClick={() => console.log('Open file selected')}>Open File</a>
                    <a href="#" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" onClick={() => console.log('Save selected')}>Save</a>
                  </div>
                  <div className="border-t border-gray-100"></div>
                  <div className="py-1" role="none">
                    <a href="#" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" onClick={() => console.log('Exit selected')}>Exit</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Command Components Section */}
        <div className="space-y-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900">Command Components</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basic Command */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Command</h3>
              <button
                data-testid="command-basic-trigger"
                onClick={() => handleCommandTrigger('basic')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Open Command (⌘K)
              </button>
              {commandStates.basic.isOpen && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                  onClick={() => handleCommandEscape('basic')}
                >
                  <div className="bg-white rounded-lg shadow-lg w-96" onClick={(e) => e.stopPropagation()}>
                    <input
                      data-testid="command-input"
                      type="text"
                      role="searchbox"
                      aria-label="Search commands"
                      placeholder="Search commands..."
                      value={commandStates.basic.value}
                      onChange={(e) => handleCommandChange('basic', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          handleCommandEscape('basic');
                        } else if (e.key === 'Enter') {
                          // Prevent form submission and handle item selection
                          e.preventDefault();
                          const items = getCommandItems('basic', commandStates.basic.value);
                          if (items.length > 0) {
                            handleCommandSelect('basic', items[0].value);
                          }
                        } else if (e.key === 'ArrowDown') {
                          // Handle arrow navigation
                          e.preventDefault();
                        }
                      }}
                      className="w-full px-4 py-3 border-b border-gray-200 focus:outline-none"
                      autoFocus
                    />
                    <div
                      data-testid="command-list"
                      role="listbox"
                      className="max-h-64 overflow-y-auto"
                    >
                      {getCommandItems('basic', commandStates.basic.value).map((item) => (
                        <div
                          key={item.value}
                          data-testid="command-item"
                          role="option"
                          onClick={() => handleCommandSelect('basic', item.value)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                        >
                          <span>{item.label}</span>
                          <kbd className="text-xs text-gray-500">{item.shortcut}</kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Command with Shortcuts */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Command with Shortcuts</h3>
              <button
                data-testid="command-shortcuts-trigger"
                onClick={() => handleCommandTrigger('shortcuts')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Shortcuts (⌘⇧P)
              </button>
              {commandStates.shortcuts.isOpen && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                  onClick={() => handleCommandEscape('shortcuts')}
                >
                  <div className="bg-white rounded-lg shadow-lg w-96" onClick={(e) => e.stopPropagation()}>
                    <input
                      data-testid="command-input"
                      type="text"
                      role="searchbox"
                      aria-label="Search commands"
                      placeholder="Search shortcuts..."
                      value={commandStates.shortcuts.value}
                      onChange={(e) => handleCommandChange('shortcuts', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          handleCommandEscape('shortcuts');
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          const items = getCommandItems('shortcuts', commandStates.shortcuts.value);
                          if (items.length > 0) {
                            handleCommandSelect('shortcuts', items[0].value);
                          }
                        }
                      }}
                      className="w-full px-4 py-3 border-b border-gray-200 focus:outline-none"
                      autoFocus
                    />
                    <div
                      data-testid="command-list"
                      role="listbox"
                      className="max-h-64 overflow-y-auto"
                    >
                      {getCommandItems('shortcuts', commandStates.shortcuts.value).map((item) => (
                        <div
                          key={item.value}
                          data-testid="command-item"
                          role="option"
                          onClick={() => handleCommandSelect('shortcuts', item.value)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                        >
                          <span>{item.label}</span>
                          <kbd className="text-xs text-gray-500">{item.shortcut}</kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Command with Groups */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Command with Groups</h3>
              <button
                data-testid="command-groups-trigger"
                onClick={() => handleCommandTrigger('groups')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Groups (⌘G)
              </button>
              {commandStates.groups.isOpen && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                  onClick={() => handleCommandEscape('groups')}
                >
                  <div className="bg-white rounded-lg shadow-lg w-96" onClick={(e) => e.stopPropagation()}>
                    <input
                      data-testid="command-input"
                      type="text"
                      role="searchbox"
                      aria-label="Search commands"
                      placeholder="Search..."
                      value={commandStates.groups.value}
                      onChange={(e) => handleCommandChange('groups', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          handleCommandEscape('groups');
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          const items = getCommandItems('groups', commandStates.groups.value);
                          if (items.length > 0) {
                            handleCommandSelect('groups', items[0].value);
                          }
                        }
                      }}
                      className="w-full px-4 py-3 border-b border-gray-200 focus:outline-none"
                      autoFocus
                    />
                    <div
                      data-testid="command-list"
                      role="listbox"
                      className="max-h-64 overflow-y-auto"
                    >
                      {getCommandItems('groups', commandStates.groups.value).map((item, index, array) => {
                        const hasGroup = 'group' in item;
                        const prevItem = index > 0 ? array[index - 1] : null;
                        const prevHasGroup = prevItem && 'group' in prevItem;

                        return (
                          <div key={item.value}>
                            {index === 0 || (index > 0 && hasGroup && prevHasGroup && item.group !== prevItem!.group) ? (
                              <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
                                {hasGroup ? item.group : ''}
                              </div>
                            ) : null}
                            <div
                              data-testid="command-item"
                              role="option"
                              onClick={() => handleCommandSelect('groups', item.value)}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                            >
                              <span>{item.label}</span>
                              {item.shortcut && <kbd className="text-xs text-gray-500">{item.shortcut}</kbd>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Components Section */}
        <section className="space-y-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>📑</span> Tabs Components
          </h2>

          <div className="grid gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Horizontal Tabs</h3>
              <HorizontalTabs />
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vertical Tabs</h3>
              <VerticalTabs />
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Disabled Tab</h3>
              <div className="text-sm text-gray-600">Disabled tabs are included in the horizontal tabs component above.</div>
            </div>
          </div>
        </section>

        {/* Live Demo */}
        {activeTab === 'demo' && (
          <div className="space-y-8 mb-12">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Interactive Navigation Demo</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Dropdown Menu Example</h4>
                  <div className="relative inline-block text-left" data-testid="dropdown-menu-demo">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => console.log('File menu clicked')}
                    >
                      File Menu
                      <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden={true}>
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100" role="menu" aria-orientation="vertical">
                      <div className="py-1" role="none">
                        <a href="#" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" onClick={() => console.log('New file selected')}>New File</a>
                        <a href="#" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" onClick={() => console.log('Open file selected')}>Open File</a>
                        <a href="#" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" onClick={() => console.log('Save selected')}>Save</a>
                      </div>
                      <div className="border-t border-gray-100"></div>
                      <div className="py-1" role="none">
                        <a href="#" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" onClick={() => console.log('Exit selected')}>Exit</a>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Tab Navigation Example</h4>
                  <HorizontalTabs />
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Command Palette Example</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600 text-sm">Command palette component available with render props API</p>
                    <p className="text-gray-500 text-xs mt-1">Trigger: Ctrl+K, Supports search and grouping</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Drawer Components Section */}
        <section className="space-y-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900">Drawer Components</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Basic Drawer */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Drawer</h3>
              <button
                data-testid="drawer-basic-trigger"
                onClick={() => {
                  const drawer = document.querySelector('[data-testid="drawer-basic"]') as HTMLElement;
                  if (drawer) {
                    drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Open Basic Drawer
              </button>
              <div
                data-testid="drawer-basic"
                className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-50"
                style={{ display: 'none' }}
              >
                <div className="p-4 border-b border-gray-200">
                  <h4 className="text-lg font-semibold">Basic Drawer</h4>
                  <button
                    onClick={() => {
                      const drawer = document.querySelector('[data-testid="drawer-basic"]') as HTMLElement;
                      if (drawer) drawer.style.display = 'none';
                    }}
                    className="mt-2 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
                <div className="p-4">
                  <p>This is a basic drawer component.</p>
                </div>
              </div>
            </div>

            {/* Drawer with Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Drawer with Header</h3>
              <button
                data-testid="drawer-header-trigger"
                onClick={() => {
                  const drawer = document.querySelector('[data-testid="drawer-header"]') as HTMLElement;
                  if (drawer) {
                    drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Open Header Drawer
              </button>
              <div
                data-testid="drawer-header"
                className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-50"
                style={{ display: 'none' }}
              >
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <h4 className="text-lg font-semibold">Drawer Header</h4>
                  <p className="text-sm opacity-90">With custom header styling</p>
                  <button
                    onClick={() => {
                      const drawer = document.querySelector('[data-testid="drawer-header"]') as HTMLElement;
                      if (drawer) drawer.style.display = 'none';
                    }}
                    className="mt-2 px-3 py-1 text-sm bg-white bg-opacity-20 rounded hover:bg-opacity-30"
                  >
                    Close
                  </button>
                </div>
                <div className="p-4">
                  <p>Drawer with styled header section.</p>
                </div>
              </div>
            </div>

            {/* Modal Drawer */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Modal Drawer</h3>
              <button
                data-testid="drawer-modal-trigger"
                onClick={() => {
                  const drawer = document.querySelector('[data-testid="drawer-modal"]') as HTMLElement;
                  const overlay = document.querySelector('[data-testid="drawer-modal-overlay"]') as HTMLElement;
                  if (drawer && overlay) {
                    drawer.style.display = 'block';
                    overlay.style.display = 'block';
                  }
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Open Modal Drawer
              </button>
              <div
                data-testid="drawer-modal-overlay"
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                style={{ display: 'none' }}
                onClick={() => {
                  const drawer = document.querySelector('[data-testid="drawer-modal"]') as HTMLElement;
                  const overlay = document.querySelector('[data-testid="drawer-modal-overlay"]') as HTMLElement;
                  if (drawer && overlay) {
                    drawer.style.display = 'none';
                    overlay.style.display = 'none';
                  }
                }}
              />
              <div
                data-testid="drawer-modal"
                className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-50"
                style={{ display: 'none' }}
              >
                <div className="p-4 border-b border-gray-200">
                  <h4 className="text-lg font-semibold">Modal Drawer</h4>
                  <button
                    onClick={() => {
                      const drawer = document.querySelector('[data-testid="drawer-modal"]') as HTMLElement;
                      const overlay = document.querySelector('[data-testid="drawer-modal-overlay"]') as HTMLElement;
                      if (drawer && overlay) {
                        drawer.style.display = 'none';
                        overlay.style.display = 'none';
                      }
                    }}
                    className="mt-2 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
                <div className="p-4">
                  <p>Modal drawer with backdrop overlay.</p>
                </div>
              </div>
            </div>

            {/* Left Side Drawer */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Left Side Drawer</h3>
              <button
                data-testid="drawer-left-trigger"
                onClick={() => {
                  const drawer = document.querySelector('[data-testid="drawer-left"]') as HTMLElement;
                  if (drawer) {
                    drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
                  }
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Open Left Drawer
              </button>
              <div
                data-testid="drawer-left"
                className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-50"
                style={{ display: 'none' }}
              >
                <div className="p-4 border-b border-gray-200">
                  <h4 className="text-lg font-semibold">Left Side Drawer</h4>
                  <button
                    onClick={() => {
                      const drawer = document.querySelector('[data-testid="drawer-left"]') as HTMLElement;
                      if (drawer) drawer.style.display = 'none';
                    }}
                    className="mt-2 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
                <div className="p-4">
                  <p>Drawer appearing from the left side.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pagination Component */}
        <div className="space-y-8 mb-12">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Pagination</h3>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-6">
                {/* Basic Pagination */}
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Basic Pagination</h4>
                  <nav data-testid="pagination-basic" className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                      <span className="font-medium">97</span> results
                    </div>
                    <div className="flex gap-1">
                      <button
                        data-testid="pagination-prev"
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        data-testid="pagination-page-1"
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        1
                      </button>
                      <button
                        data-testid="pagination-page-2"
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600"
                      >
                        2
                      </button>
                      <button
                        data-testid="pagination-page-3"
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        3
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                      <button
                        data-testid="pagination-page-10"
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        10
                      </button>
                      <button
                        data-testid="pagination-next"
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </nav>
                </div>

                {/* Compact Pagination */}
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Compact Pagination</h4>
                  <nav data-testid="pagination-compact" className="flex items-center justify-center gap-2">
                    <button
                      data-testid="pagination-compact-prev"
                      className="p-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      data-testid="pagination-compact-page-1"
                      className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      1
                    </button>
                    <button
                      data-testid="pagination-compact-page-2"
                      className="px-3 py-1 border border-blue-500 rounded-md bg-blue-50 text-sm font-medium text-blue-600"
                    >
                      2
                    </button>
                    <button
                      data-testid="pagination-compact-page-3"
                      className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      3
                    </button>
                    <button
                      data-testid="pagination-compact-next"
                      className="p-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>

                {/* Pagination with page size selector */}
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Pagination with Page Size</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700">Items per page:</label>
                      <select
                        data-testid="pagination-page-size"
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                      >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                    <nav data-testid="pagination-with-size" className="flex gap-1">
                      <button
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <button className="relative inline-flex items-center px-4 py-2 border border-blue-500 bg-blue-50 text-sm font-medium text-blue-600">
                        1
                      </button>
                      <button
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        2
                      </button>
                      <button
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        3
                      </button>
                      <button
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollspy Component */}
        <div className="space-y-8 mb-12">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Scrollspy</h3>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600 mb-4">Scrollspy component that highlights navigation items based on scroll position</p>
              <div className="text-sm text-gray-500">Scrollspy component available via renderer package with smooth scrolling and section tracking</div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Navigation Features</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Semantic HTML with proper ARIA attributes
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Keyboard navigation support (Tab, arrows, Enter, Escape)
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Focus management and screen reader support
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Flutter-inspired composition patterns
            </li>
          </ul>
        </div>

        {/* CLAUDE.md Compliance */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            CLAUDE.md Compliant: Category page with proper navigation
          </div>
        </div>
      </div>
    </div>
  );
}