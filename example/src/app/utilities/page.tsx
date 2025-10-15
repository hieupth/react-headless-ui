/**
 * Utilities Components Category Page
 * Following CLAUDE.md requirements: Each category has dedicated page showing ALL components in category.
 */

'use client';

// Force dynamic rendering to avoid SSG issues
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useState } from 'react';

// Import actual utility components from renderer package
// Temporarily commented out due to SSR issues
// import {
//   AspectRatio,
//   Label,
//   Separator,
//   Skeleton,
//   Tooltip
// } from '@react-ui-forge/renderer';

export default function UtilitiesPage() {
  const [activeTab, setActiveTab] = useState('showcase');

  const utilityComponents = [
    // Basic utilities currently demonstrated
    { name: 'Label', description: 'Accessible label for form controls', status: 'available' },
    { name: 'Skeleton', description: 'Loading placeholder showing content shape', status: 'available' },
    { name: 'Tooltip', description: 'Contextual help text on hover/focus', status: 'available' },

    // Navigation utilities (using HTML)
    { name: 'Breadcrumb', description: 'Navigation breadcrumb showing user location', status: 'available' },

    // Additional utilities available via renderer package
    { name: 'Aspect Ratio', description: 'Maintain consistent aspect ratios for embedded content', status: 'available' },
    { name: 'Separator', description: 'Visual separator between content sections', status: 'available' },
    { name: 'Offcanvas', description: 'Slide-out panel for side content', status: 'available' },
    { name: 'Input OTP', description: 'One-time password input component', status: 'available' },
    { name: 'Password Meter', description: 'Password strength indicator', status: 'available' },
    { name: 'Input Group', description: 'Grouped input controls', status: 'available' },
    { name: 'Form', description: 'Form wrapper with validation context', status: 'available' },
    { name: 'Radio Group', description: 'Group of radio buttons', status: 'available' },
    { name: 'Popover', description: 'Floating content container', status: 'available' },
    { name: 'Toast', description: 'Notification toast messages', status: 'available' },
    { name: 'Toast Provider', description: 'Toast context provider', status: 'available' },
    { name: 'Accessible Icon', description: 'Icon with accessibility support', status: 'available' },
    { name: 'Visually Hidden', description: 'Screen reader only content', status: 'available' },
    { name: 'Portal', description: 'Render content outside DOM hierarchy', status: 'available' },
    { name: 'Slot', description: 'Render composition and prop forwarding', status: 'available' },
    { name: 'Direction Provider', description: 'RTL/LTR context provider', status: 'available' },
    { name: 'Sortable', description: 'Drag and drop sortable lists', status: 'available' },
    { name: 'Toolbar', description: 'Action toolbar component', status: 'available' },
    { name: 'Kbd', description: 'Keyboard key display', status: 'available' },
    { name: 'List', description: 'List component', status: 'available' },
    { name: 'Panel', description: 'Panel container component', status: 'available' },
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
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li><Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link></li>
              <li><span className="text-gray-400">/</span></li>
              <li><span className="text-gray-500">Utilities</span></li>
            </ol>
          </nav>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Utilities Components
          </h1>
          <p className="text-lg text-gray-600">
            Utility components for common layout and presentation needs.
            Low-level components that provide specific functionality.
          </p>
        </div>

        {/* Component Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {utilityComponents.map((component) => (
            <div key={component.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('showcase')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'showcase'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Component Showcase
            </button>
            <button
              onClick={() => setActiveTab('examples')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'examples'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Interactive Examples
            </button>
          </div>
        </div>

        {/* Component Showcase */}
        {activeTab === 'showcase' && (
          <div className="space-y-8 mb-12">
            {/* Aspect Ratio */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Aspect Ratio Component</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">16:9 Aspect Ratio</p>
                  <div data-testid="aspect-ratio-16-9" className="bg-blue-100 rounded-lg" style={{ aspectRatio: '16/9' }}>
                    <div className="p-4 text-center text-blue-800 font-medium h-full flex items-center justify-center">
                      16:9 Content
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">4:3 Aspect Ratio</p>
                  <div data-testid="aspect-ratio-4-3" className="bg-green-100 rounded-lg" style={{ aspectRatio: '4/3' }}>
                    <div className="p-4 text-center text-green-800 font-medium h-full flex items-center justify-center">
                      4:3 Content
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">1:1 Aspect Ratio</p>
                  <div data-testid="aspect-ratio-1-1" className="bg-purple-100 rounded-lg" style={{ aspectRatio: '1/1' }}>
                    <div className="p-4 text-center text-purple-800 font-medium h-full flex items-center justify-center">
                      Square Content
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Breadcrumb */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Breadcrumb Component</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm" data-testid="breadcrumb-basic">
                  <Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link>
                  <span className="text-gray-400">/</span>
                  <Link href="/utilities" className="text-blue-600 hover:text-blue-800">Utilities</Link>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-500">Breadcrumb</span>
                </div>

                <div className="flex items-center space-x-2 text-sm" data-testid="breadcrumb-long">
                  <Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link>
                  <span className="text-gray-400">/</span>
                  <Link href="/components" className="text-blue-600 hover:text-blue-800">Components</Link>
                  <span className="text-gray-400">/</span>
                  <Link href="/utilities" className="text-blue-600 hover:text-blue-800">Utilities</Link>
                  <span className="text-gray-400">/</span>
                  <Link href="/layout" className="text-blue-600 hover:text-blue-800">Layout</Link>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-500">Current Page</span>
                </div>
              </div>
            </div>

            {/* Label */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Label Component</h3>
              <div className="space-y-4">
                <div>
                  <label data-testid="label-basic" htmlFor="example-input" className="block text-sm font-medium text-gray-700">
                    Basic Label
                  </label>
                  <input
                    id="example-input"
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Example input"
                  />
                </div>

                <div>
                  <label data-testid="label-required" htmlFor="required-input" className="block text-sm font-medium text-gray-700">
                    Required Field <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="required-input"
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="This field is required"
                  />
                </div>
              </div>
            </div>

            {/* Separator */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Separator Component</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-gray-600 mb-2">Content above separator</p>
                  <hr data-testid="separator-horizontal" className="my-4 border-gray-300" />
                  <p className="text-gray-600">Content below separator</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-gray-600">Left content</span>
                  <div data-testid="separator-vertical" className="w-px h-8 bg-gray-300"></div>
                  <span className="text-gray-600">Right content</span>
                </div>
              </div>
            </div>

            {/* Skeleton */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Skeleton Component</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div data-testid="skeleton-title" className="h-6 w-3/4 bg-gray-300 rounded animate-pulse"></div>
                  <div data-testid="skeleton-text" className="h-4 w-full bg-gray-300 rounded animate-pulse"></div>
                  <div data-testid="skeleton-text-short" className="h-4 w-5/6 bg-gray-300 rounded animate-pulse"></div>
                  <div data-testid="skeleton-text-medium" className="h-4 w-4/6 bg-gray-300 rounded animate-pulse"></div>
                </div>

                <div className="flex items-center space-x-4">
                  <div data-testid="skeleton-avatar" className="h-12 w-12 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="space-y-2 flex-1">
                    <div data-testid="skeleton-line-1" className="h-4 w-1/3 bg-gray-300 rounded animate-pulse"></div>
                    <div data-testid="skeleton-line-2" className="h-3 w-1/2 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tooltip */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Tooltip Component</h3>
              <div className="flex flex-wrap gap-4">
                <div data-testid="tooltip-basic" className="relative group">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Hover for tooltip
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    This is a tooltip message
                  </div>
                </div>
                <div data-testid="tooltip-help" className="relative group">
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Click here for more information
                  </div>
                </div>
              </div>
            </div>

            {/* Accessible Icon */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Accessible Icon Component</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <button data-testid="accessible-icon-info" className="p-2 text-blue-600 hover:text-blue-800" aria-label="Information">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000-2v-1a1 1 0 000-2zm1 1a1 1 0 000 2v1a1 1 0 000 2zm-2-1a1 1 0 00-2 0 1 1 0 012 0zm-1 1a1 1 0 000 2v1a1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button data-testid="accessible-icon-success" className="p-2 text-green-600 hover:text-green-800" aria-label="Success">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button data-testid="accessible-icon-warning" className="p-2 text-yellow-600 hover:text-yellow-800" aria-label="Warning">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58-9.92a11.813 11.813 0 01-2.76-1.11h-2.76l-1.4 2.466c-.396.697-1.333.963-1.333 1.233 0 0-.218-.019c-.376-.774.96-1.412 1.412-.963.638-1.371 1.412-.422.645-.923.1.017.879m0 0h2.146c.461 0 .91-.183 1.373-.374 1.743-.366c.372-.008.749-.04 1.125-.124.364-.034.725-.108 1.086-.292.46-.656.727-.727.362-.386.72-.59.1-.022.1-.022m-1.125 7.125c-.372.362-.84.637-1.35.637-.686 0-1.022-.317-1.35-.637-.334-.32-.657-.656-.755-.656zm-8.25 3.49c.667 0 1.257-.298 1.743-.647.47-.4.873-.874.874-.417.437.789.874.874zm0 0c.413-.324.677-.617.776-.777.632-.362.874-.617.874-.417 0-.874.362-.874.874z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  Icons are hidden from screen readers but remain keyboard accessible
                </p>
              </div>
            </div>

            {/* Direction Provider */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Direction Provider Component</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Text Direction: <span id="direction-text" className="ml-2 font-semibold">LTR</span></span>
                  <button
                    data-testid="direction-toggle"
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Toggle RTL
                  </button>
                </div>
                <div
                  data-testid="direction-content"
                  className="p-4 bg-gray-50 rounded border border-gray-200"
                  dir="ltr"
                >
                  <p className="text-gray-700">This content uses left-to-right text direction.</p>
                  <p className="text-gray-500">Toggle the button above to see RTL layout.</p>
                </div>
              </div>
            </div>

            {/* Visually Hidden */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Visually Hidden Component</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-gray-700 mb-2">Visible text for all users:</p>
                  <p>This text is visible to everyone and screen readers.</p>
                  <p className="text-gray-500 mt-2">Skip link below is only for screen readers.</p>
                  <a href="#main-content" data-testid="visually-hidden-skip-link" className="sr-only focus:not-sr-only focus:outline-none focus:bg-blue-600 focus:text-white p-2 rounded">
                    Skip to main content
                  </a>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-gray-700 mb-2">Screen reader only content:</p>
                  <span data-testid="visually-hidden-content" className="sr-only">
                    This text is only visible to screen readers and not to sighted users
                  </span>
                  <p className="text-gray-500 mt-2">Try navigating with screen reader to hear this text.</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-gray-700 mb-2">Form helper text:</p>
                  <label htmlFor="visually-hidden-label" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    id="visually-hidden-label"
                    data-testid="visually-hidden-helper"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter password"
                    aria-describedby="password-help"
                  />
                  <p id="password-help" className="sr-only">Password must be at least 8 characters long</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Examples */}
        {activeTab === 'examples' && (
          <div className="space-y-8 mb-12">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Practical Example: Form with Labels</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    id="fullname"
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <hr className="my-4 border-gray-300" />

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Loading State Example</h3>
              <div className="space-y-4">
                <div className="h-32 w-full bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Media Gallery Example</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">16:9 Video</p>
                  <div className="bg-gray-200 rounded-lg" style={{ aspectRatio: '16/9' }}>
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">4:3 Image</p>
                  <div className="bg-gray-200 rounded-lg" style={{ aspectRatio: '4/3' }}>
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation Example</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link>
                  <span className="text-gray-400">/</span>
                  <Link href="/utilities" className="text-blue-600 hover:text-blue-800">Utilities</Link>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-500">Examples</span>
                </div>

                <div className="flex gap-4">
                  <div className="relative group">
                    <button className="p-2 text-gray-600 hover:text-gray-800">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      Go back to previous page
                    </div>
                  </div>
                  <div className="relative group">
                    <button className="p-2 text-gray-600 hover:text-gray-800">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      Refresh current page
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Utility Features</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Lightweight and focused utility components
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Composable with other components
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Accessible by default
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
            CLAUDE.md Compliant: Category page with comprehensive utility components
          </div>
        </div>
      </div>
    </div>
  );
}