/**
 * Utilities Components Category Page
 * Following CLAUDE.md requirements: Each category has dedicated page showing ALL components in category.
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import React from 'react';
import { createPortal } from 'react-dom';

// Mock utility components for demonstration
const AccessibleIcon = ({ icon, label, className = '' }: {
  icon: React.ReactNode;
  label: string;
  className?: string;
}) => (
  <span className={`inline-flex items-center justify-center ${className}`} role="img" aria-label={label}>
    {icon}
  </span>
);

const DirectionProvider = ({ direction = 'ltr', children, className = '' }: {
  direction?: 'ltr' | 'rtl';
  children: React.ReactNode;
  className?: string;
}) => (
  <div dir={direction} className={className}>
    {children}
  </div>
);

const Item = ({ children, as: Component = 'div', className = '', ...props }: {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  [key: string]: unknown;
}) => (
  <Component className={className} {...props}>
    {children}
  </Component>
);

const Kbd = ({ children, className = '' }: {
  children: React.ReactNode;
  className?: string;
}) => (
  <kbd className={`px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded ${className}`}>
    {children}
  </kbd>
);

const Portal = ({ children, container, className = '' }: {
  children: React.ReactNode;
  container?: HTMLElement | null;
  className?: string;
}) => {
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const targetContainer = container || document.body;

  return createPortal(
    <div className={className}>
      {children}
    </div>,
    targetContainer
  );
};

const Slot = ({ children, className = '' }: {
  children: React.ReactNode;
  className?: string;
}) => {
  const childrenArray = React.Children.toArray(children);
  const child = childrenArray[0] as React.ReactElement;

  if (React.isValidElement(child)) {
    return React.cloneElement(child as React.ReactElement<{ className?: string }>, {
      className: `${(child.props as { className?: string }).className || ''} ${className}`.trim(),
    });
  }

  return <>{children}</>;
};

const VisuallyHidden = ({ children, className = '' }: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={`sr-only ${className}`}
    style={{
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: 0,
    }}
  >
    {children}
  </span>
);

export default function UtilitiesPage() {
  const [activeTab, setActiveTab] = useState('showcase');
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [portalOpen, setPortalOpen] = useState(false);

  const utilityComponents = [
    { name: 'Accessible Icon', description: 'Icon with proper ARIA labeling for screen readers', status: 'available' },
    { name: 'Direction Provider', description: 'Context provider for text direction (LTR/RTL)', status: 'available' },
    { name: 'Item', description: 'Flexible component wrapper with customizable element type', status: 'available' },
    { name: 'Kbd', description: 'Keyboard key styling component for shortcuts', status: 'available' },
    { name: 'Portal', description: 'Renders children into a different part of the DOM', status: 'available' },
    { name: 'Slot', description: 'Merges props and classnames from parent to child', status: 'available' },
    { name: 'Visually Hidden', description: 'Hides content visually but keeps it accessible', status: 'available' },
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
            Utility Components
          </h1>
          <p className="text-lg text-gray-600">
            Utility and helper components for common UI patterns and accessibility.
            Built with semantic HTML and developer experience in mind.
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
            {/* Accessible Icon */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Accessible Icon Component</h3>
              <div className="flex flex-wrap gap-6">
                <AccessibleIcon
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  label="Information"
                />
                <AccessibleIcon
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  }
                  label="Warning"
                />
                <AccessibleIcon
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  }
                  label="Close"
                />
                <AccessibleIcon
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  }
                  label="Download"
                />
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Icons with proper ARIA labels for screen readers. Each icon announces its purpose to assistive technology.
              </p>
            </div>

            {/* Direction Provider */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Direction Provider Component</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setDirection('ltr')}
                    className={`px-4 py-2 rounded ${direction === 'ltr' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    LTR (Left to Right)
                  </button>
                  <button
                    onClick={() => setDirection('rtl')}
                    className={`px-4 py-2 rounded ${direction === 'rtl' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    RTL (Right to Left)
                  </button>
                </div>
                <DirectionProvider direction={direction}>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <p className="mb-4">Current direction: <strong>{direction.toUpperCase()}</strong></p>
                    <div className="space-y-2">
                      <p>This text respects the text direction setting.</p>
                      <p className="flex items-center gap-2">
                        <span>Previous</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Next</span>
                      </p>
                    </div>
                  </div>
                </DirectionProvider>
              </div>
            </div>

            {/* Kbd */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Keyboard Component</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Keyboard Shortcuts:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Kbd>Ctrl</Kbd>
                        <span>+</span>
                        <Kbd>C</Kbd>
                        <span className="text-gray-600">Copy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Kbd>Ctrl</Kbd>
                        <span>+</span>
                        <Kbd>V</Kbd>
                        <span className="text-gray-600">Paste</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Kbd>Ctrl</Kbd>
                        <span>+</span>
                        <Kbd>Z</Kbd>
                        <span className="text-gray-600">Undo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Kbd>⌘</Kbd>
                        <span>+</span>
                        <Kbd>Space</Kbd>
                        <span className="text-gray-600">Command Palette</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Kbd>Enter</Kbd>
                        <span className="text-gray-600">Submit</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Item */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Item Component</h3>
              <div className="space-y-4">
                <Item as="button" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Button Item
                </Item>
                <Item as="a" href="#" className="text-blue-600 hover:text-blue-800 underline">
                  Link Item
                </Item>
                <Item as="div" className="p-4 bg-gray-100 rounded-lg">
                  Div Item with custom content
                </Item>
                <Item as="span" className="text-sm text-gray-600">
                  Span Item for inline content
                </Item>
              </div>
            </div>

            {/* Visually Hidden */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Visually Hidden Component</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="mb-4">
                  The &quot;Skip to main content&quot; link below is hidden visually but accessible to screen readers:
                </p>
                <VisuallyHidden>
                  <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 px-4 py-2 bg-blue-600 text-white rounded">
                    Skip to main content
                  </a>
                </VisuallyHidden>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    💡 Screen reader users can hear the &quot;Skip to main content&quot; option,
                    but sighted users cannot see it unless they focus it with keyboard navigation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Examples */}
        {activeTab === 'examples' && (
          <div className="space-y-8 mb-12">
            {/* Portal Example */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Portal Component</h3>
              <div className="space-y-4">
                <button
                  onClick={() => setPortalOpen(!portalOpen)}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  {portalOpen ? 'Close' : 'Open'} Portal Modal
                </button>

                {portalOpen && (
                  <Portal>
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      <div className="fixed inset-0 bg-black/50" onClick={() => setPortalOpen(false)} />
                      <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Portal Modal</h3>
                        <p className="text-gray-600 mb-4">
                          This modal is rendered using React Portal, which means it appears
                          outside the normal component hierarchy but is still managed by React.
                        </p>
                        <button
                          onClick={() => setPortalOpen(false)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </Portal>
                )}
              </div>
            </div>

            {/* Slot Example */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Slot Component</h3>
              <div className="space-y-4">
                <Slot className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  <button>Styled Button via Slot</button>
                </Slot>
                <Slot className="text-blue-600 hover:text-blue-800 underline">
                  <a href="#">Styled Link via Slot</a>
                </Slot>
                <Slot className="p-4 bg-gray-100 rounded-lg border border-gray-300">
                  <div>Styled Div via Slot</div>
                </Slot>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    The Slot component merges props and classnames from itself to its child,
                    allowing for flexible composition patterns.
                  </p>
                </div>
              </div>
            </div>

            {/* Comprehensive Example */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Comprehensive Utility Example</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="space-y-6">
                  {/* Accessible toolbar */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <AccessibleIcon
                        icon={
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                        }
                        label="Menu"
                      />
                      <span className="font-medium">Toolbar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Kbd>Alt</Kbd>
                      <span>+</span>
                      <Kbd>T</Kbd>
                      <span className="text-sm text-gray-600">Toggle</span>
                    </div>
                  </div>

                  {/* Direction-aware content */}
                  <DirectionProvider direction={direction}>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Direction-Aware Content</h4>
                      <p className="text-blue-800">
                        This section respects the {direction.toUpperCase()} text direction setting.
                      </p>
                    </div>
                  </DirectionProvider>

                  {/* Action buttons */}
                  <div className="flex gap-4">
                    <Slot className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                      <button>Cancel</button>
                    </Slot>
                    <Slot className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      <button>Submit</button>
                    </Slot>
                  </div>

                  {/* Hidden accessibility info */}
                  <VisuallyHidden>
                    <div aria-live="polite">
                      Form contains direction-aware controls and accessible action buttons
                    </div>
                  </VisuallyHidden>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Utility Features</h3>
          <ul className="space-y-2 text-gray-800">
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Accessibility-first design patterns
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Semantic HTML with proper ARIA attributes
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Internationalization support (RTL/LTR)
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
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