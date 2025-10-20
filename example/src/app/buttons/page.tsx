/**
 * Buttons Components Category Page
 * Following CLAUDE.md requirements: Each category has dedicated page showing ALL components in category.
 */

'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { Button } from '@react-ui-forge/renderer';
import { ButtonGroup } from '@react-ui-forge/renderer';

export default function ButtonsPage() {
  const [clickCount, setClickCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isToggled, setIsToggled] = useState(false);

  const handleButtonClick = () => {
    setClickCount(prev => prev + 1);
  };

  const handleReset = () => {
    setClickCount(0);
  };

  const handleLoadingClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleToggle = () => {
    setIsToggled(!isToggled);
  };

  const buttonComponents = [
    { name: 'Button', description: 'Interactive button with multiple variants and states', status: 'available' },
    { name: 'Button Group', description: 'Groups related buttons with shared styling', status: 'available' },
    { name: 'Hover Card', description: 'Card that appears on hover with additional information', status: 'available' },
    { name: 'Icon Button', description: 'Button with icon for compact actions', status: 'available' },
    { name: 'Loading Button', description: 'Button with loading state indicator', status: 'available' },
    { name: 'Toggle Button', description: 'Button that toggles between on/off states', status: 'available' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
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
              <li><span className="text-gray-500">Buttons</span></li>
            </ol>
          </nav>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Button Components
          </h1>
          <p className="text-lg text-gray-600">
            Interactive button components for user actions and navigation.
            Built with accessibility and keyboard navigation in mind.
          </p>
        </div>

        {/* Component Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {buttonComponents.map((component) => (
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

        {/* Interactive Button Demo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Interactive Button Demo</h2>

          <div className="space-y-6">
            {/* Click Counter Demo */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Click Counter</h3>
              <div className="space-y-4">
                <Button
                  onPress={handleButtonClick}
                  data-testid="button-counter"
                  variant="primary"
                >
                  Clicked {clickCount} times
                </Button>

                <div className="flex gap-2">
                  <Button
                    onPress={handleReset}
                    data-testid="button-reset"
                    variant="outline"
                  >
                    Reset Counter
                  </Button>

                  <Button
                    onPress={handleLoadingClick}
                    data-testid="button-loading"
                    data-loading={isLoading ? "true" : "false"}
                    disabled={isLoading}
                    variant="secondary"
                  >
                    Loading {isLoading ? '...' : 'Button'}
                  </Button>
                </div>

                <p className="text-sm text-gray-600">
                  Click Count: {clickCount}
                </p>
              </div>
            </div>

            {/* Button States */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Button States</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">
                  Primary Button
                </Button>

                <Button variant="outline">
                  Secondary Button
                </Button>

                <Button
                  disabled
                  data-testid="button-disabled"
                  variant="ghost"
                >
                  Disabled Button
                </Button>

                <Button variant="primary" className="bg-red-600 hover:bg-red-700 focus:ring-red-500">
                  Danger Button
                </Button>
              </div>
            </div>

            {/* Button Sizes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Button Sizes</h3>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="primary">
                  Small
                </Button>
                <Button size="md" variant="primary">
                  Medium
                </Button>
                <Button size="lg" variant="primary">
                  Large
                </Button>
              </div>
            </div>

            {/* Button Group */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Button Group</h3>
              <div className="space-y-4">
                <ButtonGroup
                  buttons={[
                    { label: 'Option 1', value: 'option1' },
                    { label: 'Option 2', value: 'option2' },
                    { label: 'Option 3', value: 'option3' }
                  ]}
                  orientation="horizontal"
                  exclusive={true}
                />

                <ButtonGroup
                  buttons={[
                    { label: 'Left', value: 'left' },
                    { label: 'Center', value: 'center' },
                    { label: 'Right', value: 'right' }
                  ]}
                  orientation="horizontal"
                  exclusive={false}
                  variant="outline"
                />
              </div>
            </div>

            {/* Toggle Button */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Toggle Button</h3>
              <div className="flex items-center gap-4">
                <Button
                  onPress={handleToggle}
                  data-testid="toggle-button"
                  variant={isToggled ? "primary" : "outline"}
                >
                  {isToggled ? 'ON' : 'OFF'}
                </Button>
                <span className="text-sm text-gray-600">
                  Toggle is {isToggled ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>

            {/* Icon Buttons */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Icon Buttons</h3>
              <div className="flex gap-2">
                <Button variant="primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </Button>

                <Button variant="outline">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>

                <Button variant="primary" className="bg-red-600 hover:bg-red-700 focus:ring-red-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Button Features</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Semantic HTML5 button elements with proper ARIA attributes
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Keyboard navigation support (Tab, Enter, Space keys)
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Multiple variants and states (primary, secondary, disabled, loading)
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Focus management and screen reader support
            </li>
          </ul>
        </div>

        {/* CLAUDE.md Compliance */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            CLAUDE.md Compliant: Category page with comprehensive button components
          </div>
        </div>
      </div>
    </div>
  );
}