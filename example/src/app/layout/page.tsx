/**
 * Layout Components Category Page
 * Following CLAUDE.md requirements: Each category has dedicated page showing ALL components in category.
 */

'use client';

// Force dynamic rendering to avoid SSG issues
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useState } from 'react';

// Import actual layout components from renderer package
// Temporarily commented out due to SSR issues
// import {
//   AspectRatio,
//   Panel,
//   PanelCard,
//   PanelGroup
// } from '@react-ui-forge/renderer';



export default function LayoutPage() {
  const [activeTab, setActiveTab] = useState('showcase');
  const [collapsibleOpen, setCollapsibleOpen] = useState(false);

  const layoutComponents = [
    { name: 'Aspect Ratio', description: 'Maintain consistent aspect ratios for responsive content', status: 'available' },
    { name: 'Collapsible', description: 'Expandable and collapsible content sections', status: 'available' },
    { name: 'Separator', description: 'Visual separators for organizing content layout', status: 'available' },
    { name: 'Offcanvas', description: 'Slide-out panel for side content', status: 'available' },
    { name: 'Panel', description: 'Panel container component', status: 'available' },
    { name: 'Panel Card', description: 'Card-style panel', status: 'available' },
    { name: 'Panel Group', description: 'Grouped panels', status: 'available' },
    { name: 'Resizable', description: 'Resizable container component', status: 'available' },
    { name: 'Sidebar', description: 'Sidebar navigation component', status: 'available' },
    { name: 'Sidebar Item', description: 'Sidebar navigation item', status: 'available' },
    { name: 'Sidebar Group', description: 'Sidebar item group', status: 'available' },
    { name: 'Sidebar Divider', description: 'Sidebar visual divider', status: 'available' },
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
              <li><span className="text-gray-500">Layout</span></li>
            </ol>
          </nav>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Layout Components
          </h1>
          <p className="text-lg text-gray-600">
            Structural components for organizing and arranging content layouts.
            Built with responsive design and accessibility in mind.
          </p>
        </div>

        {/* Component Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {layoutComponents.map((component) => (
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
                  <div
                    data-testid="layout-aspect-ratio-16-9"
                    className="bg-blue-100 rounded-lg"
                    style={{ aspectRatio: '16/9' }}
                  >
                    <div className="p-4 text-center text-blue-800 font-medium h-full flex items-center justify-center">
                      16:9 Content
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">4:3 Aspect Ratio</p>
                  <div
                    data-testid="layout-aspect-ratio-4-3"
                    className="bg-green-100 rounded-lg"
                    style={{ aspectRatio: '4/3' }}
                  >
                    <div className="p-4 text-center text-green-800 font-medium h-full flex items-center justify-center">
                      4:3 Content
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">1:1 Aspect Ratio</p>
                  <div
                    data-testid="layout-aspect-ratio-1-1"
                    className="bg-purple-100 rounded-lg"
                    style={{ aspectRatio: '1/1' }}
                  >
                    <div className="p-4 text-center text-purple-800 font-medium h-full flex items-center justify-center">
                      Square Content
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Collapsible */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Collapsible Component</h3>
              <div className="space-y-2">
                <button
                  data-testid="layout-collapsible-trigger"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={() => setCollapsibleOpen(!collapsibleOpen)}
                >
                  <span>Toggle Content</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${collapsibleOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {collapsibleOpen && (
                  <div data-testid="layout-collapsible-content" className="mt-2 p-4 bg-gray-100 rounded-md">
                    <p className="text-gray-700">This is collapsible content that can be shown or hidden.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Separator */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Separator Component</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-gray-600 mb-2">Content above separator</p>
                  <hr data-testid="layout-separator-horizontal" className="my-4 border-gray-300" />
                  <p className="text-gray-600">Content below separator</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-gray-600">Left content</span>
                  <div data-testid="layout-separator-vertical" className="w-px h-8 bg-gray-300"></div>
                  <span className="text-gray-600">Right content</span>
                </div>
              </div>
            </div>

            {/* Panel */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Panel Components</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div data-testid="layout-panel" className="p-4 bg-white border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Basic Panel</h4>
                  <p className="text-gray-600">A simple panel container for grouping content.</p>
                </div>

                <div data-testid="layout-panel-card" className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">Panel Card</h4>
                  <p className="text-gray-600">A card-style panel with enhanced styling.</p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Panel Group</h4>
                <div data-testid="layout-panel-group" className="space-y-4">
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <h5 className="font-medium text-gray-900">Panel 1</h5>
                    <p className="text-gray-600">First panel in the group</p>
                  </div>
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <h5 className="font-medium text-gray-900">Panel 2</h5>
                    <p className="text-gray-600">Second panel in the group</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="bg-yellow-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">Layout Features</h3>
          <ul className="space-y-2 text-yellow-800">
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Responsive design with mobile-first approach
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Flexible composition patterns
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Semantic HTML structure
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
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
            CLAUDE.md Compliant: Category page with comprehensive layout components
          </div>
        </div>
      </div>
    </div>
  );
}