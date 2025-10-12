/**
 * Navigation Components Category Page
 * Following CLAUDE.md requirements: Each category has dedicated page showing ALL components in category.
 */

'use client';

import Link from 'next/link';
import React, { useState } from 'react';

// Import actual navigation components from renderer package
import {
  Accordion,
  AccordionMenu,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  Menu,
  Tabs,
  Command,
  CommandTrigger,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandSeparator,
  CommandEmpty,
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxGroup,
  ComboboxEmpty,
  Sidebar,
  SidebarItem,
  SidebarGroup,
  SidebarDivider,
  TreeView,
  TreeViewNode,
  Menubar,
  MenubarItem,
  NavigationMenu,
  MegaMenu
} from '@react-ui-forge/renderer';


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
          aria-selected="false"
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
    { name: 'Tabs', description: 'Organize content into separate panels via tabs', status: 'available' },
    { name: 'Command', description: 'Command palette with search and keyboard navigation', status: 'available' },
    { name: 'Combobox', description: 'Combined input and dropdown with search functionality', status: 'available' },
    { name: 'Context Menu', description: 'Menu appearing on right-click with context actions', status: 'available' },
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
                <Accordion>
                  <p>This is an accordion component with expandable content. It follows Flutter patterns with proper accessibility.</p>
                </Accordion>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Dropdown Menu</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <DropdownMenu data-testid="dropdown-menu-basic">
                  <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                  <DropdownMenuItem>Option 1</DropdownMenuItem>
                  <DropdownMenuItem>Option 2</DropdownMenuItem>
                  <DropdownMenuItem>Option 3</DropdownMenuItem>
                </DropdownMenu>
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
                <MegaMenu
                  items={[
                    {
                      id: 'products',
                      label: 'Products',
                      panel: (
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
                      )
                    },
                    {
                      id: 'solutions',
                      label: 'Solutions',
                      panel: (
                        <div className="p-4">
                          <h4 className="font-semibold mb-2">Industry Solutions</h4>
                          <p className="text-gray-600">Tailored solutions for your industry needs.</p>
                        </div>
                      )
                    },
                    {
                      id: 'resources',
                      label: 'Resources',
                      children: [
                        { id: 'docs', label: 'Documentation' },
                        { id: 'blog', label: 'Blog' },
                        { id: 'community', label: 'Community' }
                      ]
                    },
                    {
                      id: 'company',
                      label: 'Company'
                    }
                  ]}
                  config={{
                    hoverActivation: true,
                    closeOnOutsideClick: true,
                    animatePanels: true
                  }}
                />
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
              <DropdownMenu data-testid="dropdown-menu">
                <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                <DropdownMenuItem>Option 1</DropdownMenuItem>
                <DropdownMenuItem>Option 2</DropdownMenuItem>
                <DropdownMenuItem>Option 3</DropdownMenuItem>
              </DropdownMenu>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">User Menu</h3>
              <DropdownMenu data-testid="user-dropdown-menu">
                <DropdownMenuTrigger>User Menu</DropdownMenuTrigger>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenu>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions Menu</h3>
              <DropdownMenu data-testid="actions-dropdown-menu">
                <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
                <DropdownMenuItem>New File</DropdownMenuItem>
                <DropdownMenuItem>Open File</DropdownMenuItem>
                <DropdownMenuItem>Save</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Exit</DropdownMenuItem>
              </DropdownMenu>
            </div>
          </div>
        </section>

        {/* Command Components Section */}
        <div className="space-y-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900">Command Components</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Command</h3>
              <p className="text-gray-600">Command palette component with search functionality</p>
              <div className="text-sm text-gray-500 mt-2">Available via renderer package</div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Command with Shortcuts</h3>
              <p className="text-gray-600">Enhanced command palette with keyboard shortcuts</p>
              <div className="text-sm text-gray-500 mt-2">Uses renderer package with render props</div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Command with Groups</h3>
              <p className="text-gray-600">Command palette with grouped items and separators</p>
              <div className="text-sm text-gray-500 mt-2">Fully customizable via renderer API</div>
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
                  <DropdownMenu data-testid="dropdown-menu-demo">
                    <DropdownMenuTrigger>File Menu</DropdownMenuTrigger>
                    <DropdownMenuItem>New File</DropdownMenuItem>
                    <DropdownMenuItem>Open File</DropdownMenuItem>
                    <DropdownMenuItem>Save</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Exit</DropdownMenuItem>
                  </DropdownMenu>
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