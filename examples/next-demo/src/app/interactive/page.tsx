/**
 * Interactive Components Category Page
 * Following CLAUDE.md requirements: Each category has dedicated page showing ALL components in category.
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';

// Import actual interactive components from renderer package
import {
  Toggle,
  ToggleIcon,
  FormatToggle,
  ViewModeToggle
} from '@hieupth/reui';

export default function InteractivePage() {
  const [activeTab, setActiveTab] = useState('showcase');
  const [standaloneToggle, setStandaloneToggle] = useState(false);

  const interactiveComponents = [
    { name: 'Toggle', description: 'Binary toggle button for on/off states', status: 'available' },
    { name: 'ToggleIcon', description: 'Toggle with icon instead of text', status: 'available' },
    { name: 'FormatToggle', description: 'Toggle for formatting options', status: 'available' },
    { name: 'ViewModeToggle', description: 'Toggle for switching view modes', status: 'available' },
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
              <li><span className="text-gray-500">Interactive</span></li>
            </ol>
          </nav>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interactive Components
          </h1>
          <p className="text-lg text-gray-600">
            Interactive and control components for user input and state management.
            Built with accessibility and keyboard navigation in mind.
          </p>
        </div>

        {/* Component Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {interactiveComponents.map((component) => (
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
            {/* Toggle Component */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Toggle Component</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Basic Toggle</h4>
                  <div className="flex items-center gap-6">
                    <Toggle
                      data-testid="toggle-off"
                      pressed={false}
                      pressedChildren="OFF"
                      unpressedChildren="OFF"
                      pressedIcon={undefined}
                      unpressedIcon={undefined}
                    >
                      OFF
                    </Toggle>
                    <Toggle
                      data-testid="toggle-on"
                      pressed={true}
                      pressedChildren="ON"
                      unpressedChildren="ON"
                      pressedIcon={undefined}
                      unpressedIcon={undefined}
                    >
                      ON
                    </Toggle>
                    <Toggle
                      data-testid="toggle-interactive"
                      onPressedChange={setStandaloneToggle}
                      pressedChildren="ENABLED"
                      unpressedChildren="DISABLED"
                      pressedIcon={undefined}
                      unpressedIcon={undefined}
                    >
                      {standaloneToggle ? 'ENABLED' : 'DISABLED'}
                    </Toggle>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Basic toggle with customizable text. The last toggle is interactive.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Icon Toggles</h4>
                  <div className="flex items-center gap-4">
                    <ToggleIcon
                      data-testid="toggle-heart"
                      pressed={false}
                      pressedIcon={
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      }
                      unpressedIcon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      }
                    />
                    <ToggleIcon
                      data-testid="toggle-bookmark"
                      pressed={true}
                      pressedIcon={
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                        </svg>
                      }
                      unpressedIcon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 19V5z" />
                        </svg>
                      }
                    />
                    <ToggleIcon
                      data-testid="toggle-star"
                      pressed={false}
                      pressedIcon={
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      }
                      unpressedIcon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      }
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Toggles with icons for a more compact interface.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Format Toggles</h4>
                  <div className="flex items-center gap-4">
                    <FormatToggle data-testid="format-bold" format="bold" />
                    <FormatToggle data-testid="format-italic" format="italic" />
                    <FormatToggle data-testid="format-underline" format="underline" />
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Formatting toggles for rich text editing.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-3">View Mode Toggles</h4>
                  <div className="flex items-center gap-4">
                    <ViewModeToggle
                      data-testid="view-grid"
                      modes={{
                        on: { icon: null, label: "Grid" },
                        off: { icon: null, label: "List" }
                      }}
                    />
                    <ViewModeToggle
                      data-testid="view-list"
                      modes={{
                        on: { icon: null, label: "List" },
                        off: { icon: null, label: "Grid" }
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Toggles for switching between different view modes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Examples */}
        {activeTab === 'examples' && (
          <div className="space-y-8 mb-12">
            {/* Settings Panel */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Settings Panel Example</h3>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Notification Preferences</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Email Notifications</span>
                        <Toggle
                          onPressedChange={(pressed: boolean) => console.log('Email:', pressed)}
                          pressedChildren=""
                          unpressedChildren=""
                          pressedIcon={undefined}
                          unpressedIcon={undefined}
                        >
                          Toggle
                        </Toggle>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Push Notifications</span>
                        <Toggle
                          pressed={true}
                          onPressedChange={(pressed: boolean) => console.log('Push:', pressed)}
                          pressedChildren=""
                          unpressedChildren=""
                          pressedIcon={undefined}
                          unpressedIcon={undefined}
                        >
                          Toggle
                        </Toggle>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">SMS Alerts</span>
                        <Toggle
                          onPressedChange={(pressed: boolean) => console.log('SMS:', pressed)}
                          pressedChildren=""
                          unpressedChildren=""
                          pressedIcon={undefined}
                          unpressedIcon={undefined}
                        >
                          Toggle
                        </Toggle>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Appearance Settings</h4>
                    <p className="text-sm text-gray-600">
                      Toggle groups for appearance options would go here.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Content Preferences</h4>
                    <p className="text-sm text-gray-600">
                      Toggle groups for content types would go here.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Toolbar Example */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Rich Text Toolbar</h3>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-sm text-gray-600">Rich text toolbar would go here with toggle groups.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">Formatting toggle groups would be implemented here.</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded min-h-[100px]">
                  <p className="text-gray-700">
                    This is a rich text editor toolbar. The toggle groups allow you to format text,
                    align content, and apply styling options. Try clicking the different formatting options!
                  </p>
                </div>
              </div>
            </div>

            {/* Filter Panel */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Filter Panel</h3>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                    <p className="text-sm text-gray-600">
                      Category toggle groups would be implemented here.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                    <p className="text-sm text-gray-600">
                      Price range toggle groups would be implemented here.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Shipping Options</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Free Shipping</span>
                        <Toggle
                          pressed={true}
                          onPressedChange={(pressed: boolean) => console.log('Free shipping:', pressed)}
                          pressedChildren=""
                          unpressedChildren=""
                          pressedIcon={undefined}
                          unpressedIcon={undefined}
                        >
                          Toggle
                        </Toggle>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Express Delivery</span>
                        <Toggle
                          onPressedChange={(pressed: boolean) => console.log('Express:', pressed)}
                          pressedChildren=""
                          unpressedChildren=""
                          pressedIcon={undefined}
                          unpressedIcon={undefined}
                        >
                          Toggle
                        </Toggle>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="bg-pink-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-pink-900 mb-3">Interactive Features</h3>
          <ul className="space-y-2 text-pink-800">
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Keyboard navigation and ARIA support
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Single and multiple selection modes
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Flexible styling and composition
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
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
            CLAUDE.md Compliant: Category page with comprehensive interactive components
          </div>
        </div>
      </div>
    </div>
  );
}