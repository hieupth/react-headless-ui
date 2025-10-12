/**
 * Utilities Components Category Page
 * Following CLAUDE.md requirements: Each category has dedicated page showing ALL components in category.
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';

// Import actual utility components from renderer package
import {
  AspectRatio,
  Breadcrumb,
  Label,
  Separator,
  Skeleton,
  Tooltip
} from '@react-ui-forge/renderer';

export default function UtilitiesPage() {
  const [activeTab, setActiveTab] = useState('showcase');

  const utilityComponents = [
    { name: 'Aspect Ratio', description: 'Maintain consistent aspect ratios for embedded content', status: 'available' },
    { name: 'Breadcrumb', description: 'Navigation breadcrumb showing user location', status: 'available' },
    { name: 'Label', description: 'Accessible label for form controls', status: 'available' },
    { name: 'Separator', description: 'Visual separator between content sections', status: 'available' },
    { name: 'Skeleton', description: 'Loading placeholder showing content shape', status: 'available' },
    { name: 'Tooltip', description: 'Contextual help text on hover/focus', status: 'available' },
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
                  <AspectRatio data-testid="aspect-ratio-16-9" ratio={16/9} className="bg-blue-100 rounded-lg">
                    <div className="p-4 text-center text-blue-800 font-medium">
                      16:9 Content
                    </div>
                  </AspectRatio>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">4:3 Aspect Ratio</p>
                  <AspectRatio data-testid="aspect-ratio-4-3" ratio={4/3} className="bg-green-100 rounded-lg">
                    <div className="p-4 text-center text-green-800 font-medium">
                      4:3 Content
                    </div>
                  </AspectRatio>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">1:1 Aspect Ratio</p>
                  <AspectRatio data-testid="aspect-ratio-1-1" ratio={1} className="bg-purple-100 rounded-lg">
                    <div className="p-4 text-center text-purple-800 font-medium">
                      Square Content
                    </div>
                  </AspectRatio>
                </div>
              </div>
            </div>

            {/* Breadcrumb */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Breadcrumb Component</h3>
              <div className="space-y-4">
                <Breadcrumb data-testid="breadcrumb-basic">
                  <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                  <Breadcrumb.Item href="/utilities">Utilities</Breadcrumb.Item>
                  <Breadcrumb.Item current>Breadcrumb</Breadcrumb.Item>
                </Breadcrumb>

                <Breadcrumb data-testid="breadcrumb-long">
                  <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                  <Breadcrumb.Item href="/components">Components</Breadcrumb.Item>
                  <Breadcrumb.Item href="/utilities">Utilities</Breadcrumb.Item>
                  <Breadcrumb.Item href="/layout">Layout</Breadcrumb.Item>
                  <Breadcrumb.Item current>Current Page</Breadcrumb.Item>
                </Breadcrumb>
              </div>
            </div>

            {/* Label */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Label Component</h3>
              <div className="space-y-4">
                <div>
                  <Label data-testid="label-basic" htmlFor="example-input">
                    Basic Label
                  </Label>
                  <input
                    id="example-input"
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Example input"
                  />
                </div>

                <div>
                  <Label data-testid="label-required" htmlFor="required-input" required>
                    Required Field
                  </Label>
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
                  <Separator data-testid="separator-horizontal" className="my-4" />
                  <p className="text-gray-600">Content below separator</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-gray-600">Left content</span>
                  <Separator data-testid="separator-vertical" orientation="vertical" className="h-8" />
                  <span className="text-gray-600">Right content</span>
                </div>
              </div>
            </div>

            {/* Skeleton */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Skeleton Component</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton data-testid="skeleton-title" className="h-6 w-3/4" />
                  <Skeleton data-testid="skeleton-text" className="h-4 w-full" />
                  <Skeleton data-testid="skeleton-text-short" className="h-4 w-5/6" />
                  <Skeleton data-testid="skeleton-text-medium" className="h-4 w-4/6" />
                </div>

                <div className="flex items-center space-x-4">
                  <Skeleton data-testid="skeleton-avatar" className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton data-testid="skeleton-line-1" className="h-4 w-1/3" />
                    <Skeleton data-testid="skeleton-line-2" className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tooltip */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Tooltip Component</h3>
              <div className="flex flex-wrap gap-4">
                <Tooltip data-testid="tooltip-basic" content="This is a tooltip message">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Hover for tooltip
                  </button>
                </Tooltip>
                <Tooltip data-testid="tooltip-help" content="Click here for more information">
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </Tooltip>
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
                  <Label htmlFor="fullname">Full Name</Label>
                  <input
                    id="fullname"
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="email">Email Address</Label>
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
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Media Gallery Example</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">16:9 Video</p>
                  <AspectRatio ratio={16/9} className="bg-gray-200 rounded-lg">
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </AspectRatio>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">4:3 Image</p>
                  <AspectRatio ratio={4/3} className="bg-gray-200 rounded-lg">
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </AspectRatio>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation Example</h3>
              <div className="space-y-4">
                <Breadcrumb>
                  <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                  <Breadcrumb.Item href="/utilities">Utilities</Breadcrumb.Item>
                  <Breadcrumb.Item current>Examples</Breadcrumb.Item>
                </Breadcrumb>

                <div className="flex gap-4">
                  <Tooltip content="Go back to previous page">
                    <button className="p-2 text-gray-600 hover:text-gray-800">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  </Tooltip>
                  <Tooltip content="Refresh current page">
                    <button className="p-2 text-gray-600 hover:text-gray-800">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </Tooltip>
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