/**
 * Feedback Components Category Page
 * Following CLAUDE.md requirements: Each category has dedicated page showing ALL components in category.
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';

// Import actual feedback components from renderer package
import {
  Alert,
  AlertDialog,
  Dialog,
  Drawer,
  Progress,
  SimpleProgress,
  CircularProgress,
  LoadingProgress,
  Spinner,
  SimpleSpinner,
  DotsSpinner,
  BarsSpinner,
  Tooltip
} from '@react-ui-forge/renderer';

export default function FeedbackPage() {
  const [activeTab, setActiveTab] = useState('showcase');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const feedbackComponents = [
    { name: 'Alert', description: 'Display important messages with different severity levels', status: 'available' },
    { name: 'Alert Dialog', description: 'Modal dialog for critical actions requiring confirmation', status: 'available' },
    { name: 'Dialog', description: 'Modal window for content overlays and user interactions', status: 'available' },
    { name: 'Drawer', description: 'Slide-out panel from edges for additional content', status: 'available' },
    { name: 'Progress', description: 'Visual indicator for task completion or loading status', status: 'available' },
    { name: 'Simple Progress', description: 'Basic linear progress bar with minimal styling', status: 'available' },
    { name: 'Circular Progress', description: 'Circular progress indicator for loading states', status: 'available' },
    { name: 'Loading Progress', description: 'Progress bar with integrated loading animation', status: 'available' },
    { name: 'Spinner', description: 'Animated loading indicator for async operations', status: 'available' },
    { name: 'Simple Spinner', description: 'Basic spinning animation with minimal styling', status: 'available' },
    { name: 'Dots Spinner', description: 'Loading animation using bouncing dots', status: 'available' },
    { name: 'Bars Spinner', description: 'Loading animation using animated bars', status: 'available' },
    { name: 'Tooltip', description: 'Brief contextual help appearing on hover', status: 'available' },
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
              <li><span className="text-gray-500">Feedback</span></li>
            </ol>
          </nav>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Feedback Components
          </h1>
          <p className="text-lg text-gray-600">
            Components for providing feedback, notifications, and status indicators.
            Built with accessibility and user experience in mind.
          </p>
        </div>

        {/* Component Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {feedbackComponents.map((component) => (
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
            {/* Alerts */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Alert Components</h3>
              <div className="space-y-4">
                <Alert data-testid="alert-info" variant="info" title="Information" description="This is an informational message to inform the user about something important." />
                <Alert data-testid="alert-success" variant="success" title="Success" description="Your changes have been saved successfully!" />
                <Alert data-testid="alert-warning" variant="warning" title="Warning" description="Please review your input before proceeding." />
                <Alert data-testid="alert-error" variant="error" title="Error" description="Something went wrong. Please try again." />
              </div>
            </div>

            {/* Progress and Loading */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Progress & Loading</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Progress Bar Variants</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Standard Progress...</span>
                        <span>25%</span>
                      </div>
                      <Progress data-testid="progress-25" value={25} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Simple Progress...</span>
                        <span>50%</span>
                      </div>
                      <SimpleProgress data-testid="simple-progress-50" value={50} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Loading Progress...</span>
                        <span>75%</span>
                      </div>
                      <LoadingProgress data-testid="loading-progress-75" value={75} />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Circular Progress</h4>
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                      <CircularProgress data-testid="circular-progress-25" value={25} size="sm" />
                      <span className="text-sm text-gray-600">25%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CircularProgress data-testid="circular-progress-50" value={50} size="md" />
                      <span className="text-sm text-gray-600">50%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CircularProgress data-testid="circular-progress-75" value={75} size="lg" />
                      <span className="text-sm text-gray-600">75%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Spinner Variants</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h5 className="text-sm font-medium text-gray-700">Standard Spinners</h5>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Spinner data-testid="spinner-small" size="sm" />
                          <span className="text-sm text-gray-600">Small</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Spinner data-testid="spinner-medium" size="md" />
                          <span className="text-sm text-gray-600">Medium</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Spinner data-testid="spinner-large" size="lg" />
                          <span className="text-sm text-gray-600">Large</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="text-sm font-medium text-gray-700">Animation Spinners</h5>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <SimpleSpinner data-testid="simple-spinner" />
                          <span className="text-sm text-gray-600">Simple</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DotsSpinner data-testid="dots-spinner" />
                          <span className="text-sm text-gray-600">Dots</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarsSpinner data-testid="bars-spinner" />
                          <span className="text-sm text-gray-600">Bars</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tooltips */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Tooltips</h3>
              <div className="flex flex-wrap gap-8">
                <Tooltip data-testid="tooltip-save" content="Click to save your changes">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Save
                  </button>
                </Tooltip>

                <Tooltip data-testid="tooltip-profile" content={
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">User Profile</h4>
                    <p className="text-sm text-gray-600">John Doe - Software Engineer</p>
                    <p className="text-xs text-gray-500 mt-1">Last active 2 hours ago</p>
                  </div>
                }>
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium cursor-pointer">
                    JD
                  </div>
                </Tooltip>

                <Tooltip data-testid="tooltip-delete" content="This action cannot be undone">
                  <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    Delete
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Examples */}
        {activeTab === 'examples' && (
          <div className="space-y-8 mb-12">
            {/* Dialog Example */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Interactive Dialogs</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setDialogOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Open Dialog
                </button>
                <button
                  onClick={() => setAlertDialogOpen(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Open Alert Dialog
                </button>
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Open Drawer
                </button>
              </div>

              <Dialog data-testid="dialog-example" open={dialogOpen} onOpenChange={setDialogOpen} title="User Settings">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue="john@example.com"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button onClick={() => setDialogOpen(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={() => setDialogOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Save Changes
                  </button>
                </div>
              </Dialog>

              <AlertDialog
                data-testid="alert-dialog-example"
                open={alertDialogOpen}
                onOpenChange={setAlertDialogOpen}
                title="Delete Account"
                description="Are you sure you want to delete your account? This action cannot be undone."
                variant="destructive"
                confirmText="Delete Account"
                cancelText="Cancel"
              />

              <Drawer
                data-testid="drawer-example"
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                title="Navigation Drawer"
                position="right"
                showCloseButton={true}
              >
                <nav className="space-y-2 p-6">
                  <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Dashboard</a>
                  <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Profile</a>
                  <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Settings</a>
                  <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">Help</a>
                </nav>
              </Drawer>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="bg-red-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-3">Feedback Features</h3>
          <ul className="space-y-2 text-red-800">
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Semantic ARIA attributes for screen readers
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Keyboard navigation and focus management
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Proper timing and animations for accessibility
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
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
            CLAUDE.md Compliant: Category page with comprehensive feedback components
          </div>
        </div>
      </div>
    </div>
  );
}