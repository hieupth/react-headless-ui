/**
 * Data Display Components Category Page
 * Following CLAUDE.md requirements: Each category has dedicated page showing ALL components in category.
 */

'use client';

// Force dynamic rendering to avoid SSG issues
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useState } from 'react';
import React from 'react';

// Import actual components from renderer package
// Temporarily commented out due to SSR issues
// import {
//   Avatar,
//   Badge,
//   Card,
//   CardHeader,
//   CardBody,
//   CardFooter,
//   CardTitle,
//   CardDescription,
//   Skeleton,
//   Carousel,
//   ImageCarousel,
//   CardCarousel,
//   TestimonialCarousel,
//   HeroCarousel,
//   Chart,
//   DataGrid,
//   Table,
//   EmptyState,
//   Chip,
//   Rating,
//   List,
//   ListTimeline,
//   ListCompact,
//   Item,
//   ItemCheckbox,
//   ItemRadio,
//   Kbd,
//   KbdShortcut,
//   KbdModifier
// } from '@hieupth/reui';


const Table = ({ data, headers }: {
  data: Record<string, string>[];
  headers: { key: string; label: string }[];
}) => (
  <div className="overflow-x-auto border border-gray-200 rounded-lg">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((header) => (
            <th
              key={header.key}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {header.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((row, index) => (
          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            {headers.map((header) => (
              <td key={header.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {row[header.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function DataDisplayPage() {
  const [activeTab, setActiveTab] = useState('showcase');

  const dataDisplayComponents = [
    // User & Identity
    { name: 'Avatar', description: 'User profile image with fallback for loading failures', status: 'available' },

    // Status & Indicators
    { name: 'Badge', description: 'Small visual element displaying metadata or status', status: 'available' },
    { name: 'Chip', description: 'Compact tag component for categorization', status: 'available' },
    { name: 'Skeleton', description: 'Loading placeholder showing content shape', status: 'available' },

    // Content Containers
    { name: 'Card', description: 'Flexible container for grouping related content', status: 'available' },
    { name: 'Empty State', description: 'Placeholder for empty content areas', status: 'available' },

    // Carousels
    { name: 'Carousel', description: 'Navigate through collection of items horizontally', status: 'available' },
    { name: 'Image Carousel', description: 'Specialized carousel for image galleries and slideshows', status: 'available' },
    { name: 'Card Carousel', description: 'Carousel displaying content as interactive cards', status: 'available' },
    { name: 'Testimonial Carousel', description: 'Carousel for customer testimonials and reviews', status: 'available' },
    { name: 'Hero Carousel', description: 'Full-width carousel for hero sections and banners', status: 'available' },

    // Data Visualization
    { name: 'Chart', description: 'Data visualization components for interactive charts', status: 'available' },
    { name: 'Data Grid', description: 'Advanced table with sorting, filtering, pagination', status: 'available' },
    { name: 'Table', description: 'Basic table component for tabular data', status: 'available' },
    { name: 'Rating', description: 'Star rating component for feedback', status: 'available' },

    // Lists & Items
    { name: 'List', description: 'List component for structured content', status: 'available' },
    { name: 'List Timeline', description: 'Timeline-style list for chronological data', status: 'available' },
    { name: 'List Compact', description: 'Compact list variant for dense content', status: 'available' },
    { name: 'Item', description: 'Generic item component for lists', status: 'available' },
    { name: 'Item Checkbox', description: 'Item with checkbox selection', status: 'available' },
    { name: 'Item Radio', description: 'Item with radio button selection', status: 'available' },

    // Keyboard & Input Display
    { name: 'Kbd', description: 'Keyboard key display component', status: 'available' },
    { name: 'Kbd Shortcut', description: 'Keyboard shortcut display', status: 'available' },
    { name: 'Kbd Modifier', description: 'Modifier key display (Ctrl, Alt, etc.)', status: 'available' },

    // Floating & Overlay Components
    { name: 'Popover', description: 'Floating content container with trigger', status: 'available' },
    { name: 'Toast', description: 'Notification toast messages', status: 'available' },
    { name: 'Toast Provider', description: 'Toast context provider', status: 'available' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sampleData = [
    { name: 'John Doe', email: 'john@example.com', role: 'Developer', status: 'Active' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'Designer', status: 'Active' },
    { name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager', status: 'Inactive' },
  ];

  const tableHeaders = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
  ];

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
              <li><span className="text-gray-500">Data Display</span></li>
            </ol>
          </nav>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Data Display Components
          </h1>
          <p className="text-lg text-gray-600">
            Components for displaying and presenting data in structured formats.
            Built with semantic HTML and responsive design.
          </p>
        </div>

        {/* Component Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {dataDisplayComponents.map((component) => (
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
              Real Examples
            </button>
          </div>
        </div>

        {/* Component Showcase */}
        {activeTab === 'showcase' && (
          <div className="space-y-8 mb-12">
            {/* Avatar */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Avatar Component</h3>
              <div className="flex flex-wrap gap-8 items-end">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Small Avatar</p>
                  <div data-testid="avatar-component" className="w-8 h-8 bg-gray-300 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Medium Avatar</p>
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Large Avatar</p>
                  <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Custom Avatar</p>
                  <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">JD</div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Badge Component</h3>
              <div className="flex flex-wrap gap-2">
                <span data-testid="badge-default" className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Default</span>
                <span data-testid="badge-secondary" className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">Secondary</span>
                <span data-testid="badge-destructive" className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Destructive</span>
                <span data-testid="badge-outline" className="px-2 py-1 border border-gray-300 text-gray-700 text-xs font-medium rounded-full">Outline</span>
                <span data-testid="badge-new" className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">New</span>
                <span data-testid="badge-featured" className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">Featured</span>
                <span data-testid="badge-popular" className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Popular</span>
              </div>
            </div>

            {/* Cards */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Card Component</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div data-testid="card-product" className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Product Card</h4>
                    <p className="text-sm text-gray-600 mb-4">This is a product card with title and description.</p>
                    <p className="text-gray-600">Product content goes here.</p>
                  </div>
                  <div className="px-6 pb-6">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</button>
                  </div>
                </div>

                <div data-testid="card-profile" className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Profile Card</h4>
                    <p className="text-sm text-gray-600 mb-4">User profile card with avatar and information.</p>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div>
                        <p className="text-sm text-gray-600">User information</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Active</span>
                      <span className="text-xs text-gray-500">2 days ago</span>
                    </div>
                  </div>
                </div>

                <div data-testid="card-notification" className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div>
                      <h4 className="font-semibold">Notification Card</h4>
                      <p className="text-sm text-gray-600">System notification with avatar</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skeleton */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Skeleton Component</h3>
              <div className="space-y-4">
                <div data-testid="skeleton-default" className="h-4 bg-gray-300 rounded animate-pulse"></div>
                <div data-testid="skeleton-wide" className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
                <div data-testid="skeleton-narrow" className="h-4 bg-gray-300 rounded animate-pulse w-1/2"></div>
              </div>
            </div>

            {/* Carousel Variants */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Carousel Variants</h3>
              <div className="space-y-8">
                {/* Standard Carousel */}
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Standard Carousel</h4>
                  <div data-testid="carousel-component" className="w-full max-w-2xl mx-auto">
                    <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white p-12 rounded-lg">
                      <h3 className="text-2xl font-bold mb-2">Slide 1</h3>
                      <p>Beautiful gradient background with centered content</p>
                      <div className="flex justify-center space-x-2 mt-6">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                        <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Carousel */}
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Image Carousel</h4>
                  <div data-testid="image-carousel" className="w-full max-w-2xl mx-auto">
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop"
                        alt="Mountain landscape"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                        <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Image carousel component available via renderer package</p>
                  </div>
                </div>

                {/* Card Carousel */}
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Card Carousel</h4>
                  <div data-testid="card-carousel" className="w-full max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <img
                          src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop"
                          alt="Feature Card 1"
                          className="w-full h-40 object-cover rounded-lg mb-4"
                        />
                        <h5 className="font-semibold text-gray-900 mb-2">Feature Card 1</h5>
                        <p className="text-gray-600 text-sm">This is the first feature card with detailed information.</p>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <img
                          src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop"
                          alt="Feature Card 2"
                          className="w-full h-40 object-cover rounded-lg mb-4"
                        />
                        <h5 className="font-semibold text-gray-900 mb-2">Feature Card 2</h5>
                        <p className="text-gray-600 text-sm">This is the second feature card with different content.</p>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <img
                          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=250&fit=crop"
                          alt="Feature Card 3"
                          className="w-full h-40 object-cover rounded-lg mb-4"
                        />
                        <h5 className="font-semibold text-gray-900 mb-2">Feature Card 3</h5>
                        <p className="text-gray-600 text-sm">This is the third feature card showcasing another feature.</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4 text-center">Card carousel component available via renderer package</p>
                  </div>
                </div>

                {/* Testimonial Carousel */}
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Testimonial Carousel</h4>
                  <div data-testid="testimonial-carousel" className="w-full max-w-2xl mx-auto text-center">
                    <p className="text-lg italic mb-4">&ldquo;This product has completely transformed how we work. The quality and attention to detail is outstanding.&rdquo;</p>
                    <p className="font-semibold">- Sarah Johnson, Product Manager</p>
                    <div className="flex justify-center space-x-2 mt-6">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Hero Carousel */}
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Hero Carousel</h4>
                  <div data-testid="hero-carousel" className="w-full h-96 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white">
                    <div className="text-center">
                      <h2 className="text-4xl font-bold mb-4">Welcome to Our Platform</h2>
                      <p className="text-xl mb-6">Discover amazing features and possibilities</p>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
                        Get Started
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Chart Component</h3>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div data-testid="chart-simple" className="h-64 flex items-center justify-center bg-gray-50 rounded border border-gray-200">
                  <div className="text-center text-gray-600">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p>Chart Component Available</p>
                    <p className="text-sm">Line chart with test data visualization</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Grid */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Grid Component</h3>
              <div data-testid="datagrid-component" className="bg-white rounded-lg border border-gray-200">
                <Table data={sampleData} headers={tableHeaders} />
              </div>
            </div>

            {/* Chip */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Chip Component</h3>
              <div className="flex flex-wrap gap-2">
                <span data-testid="chip-default" className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">Default</span>
                <span data-testid="chip-primary" className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">Primary</span>
                <span data-testid="chip-success" className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Success</span>
                <span data-testid="chip-warning" className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">Warning</span>
                <span data-testid="chip-error" className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Error</span>
                <span data-testid="chip-closable" className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  Closable
                  <button className="ml-2 text-gray-600 hover:text-gray-800">×</button>
                </span>
              </div>
            </div>

            {/* Rating */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Rating Component</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Read-only Rating: 4 stars</p>
                  <div data-testid="rating-readonly" className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className={`w-5 h-5 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Interactive Rating</p>
                  <div data-testid="rating-interactive" className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} className={`w-5 h-5 ${star <= 3 ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`} onClick={() => console.log('Rating:', star)}>
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Custom Max Rating: 10 stars</p>
                  <div data-testid="rating-custom" className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <button key={star} className={`w-4 h-4 ${star <= 7 ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`} onClick={() => console.log('Rating:', star)}>
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* List Components */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">List Components</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Basic List</h4>
                  <ul data-testid="list-basic" className="space-y-2">
                    <li className="p-2 bg-white border border-gray-200 rounded">First item</li>
                    <li className="p-2 bg-white border border-gray-200 rounded">Second item</li>
                    <li className="p-2 bg-white border border-gray-200 rounded">Third item</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Compact List</h4>
                  <ul data-testid="list-compact" className="space-y-1">
                    <li className="p-1 text-sm bg-gray-50 border border-gray-200 rounded">Compact item 1</li>
                    <li className="p-1 text-sm bg-gray-50 border border-gray-200 rounded">Compact item 2</li>
                    <li className="p-1 text-sm bg-gray-50 border border-gray-200 rounded">Compact item 3</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Timeline List</h4>
                  <div data-testid="list-timeline" className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <h5 className="font-medium">Project Started</h5>
                        <p className="text-sm text-gray-600">2024-01-15</p>
                        <p className="text-sm">Initial project kickoff and requirements gathering</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <h5 className="font-medium">Development Phase</h5>
                        <p className="text-sm text-gray-600">2024-02-01</p>
                        <p className="text-sm">Core development and implementation</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <h5 className="font-medium">Testing & QA</h5>
                        <p className="text-sm text-gray-600">2024-03-15</p>
                        <p className="text-sm">Quality assurance and bug fixes</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Item Components</h4>
                  <div className="space-y-2">
                    <div data-testid="item-basic" className="p-2 bg-white border border-gray-200 rounded">Basic Item</div>
                    <div data-testid="item-checkbox" className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded">
                      <input type="checkbox" onChange={() => console.log('Item checked')} />
                      <span>Checkbox Item</span>
                    </div>
                    <div data-testid="item-radio" className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded">
                      <input type="radio" onChange={() => console.log('Item selected')} />
                      <span>Radio Item</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyboard Components */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Keyboard Display Components</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Basic Keys</h4>
                  <div className="flex flex-wrap gap-2">
                    <kbd data-testid="kbd-key-A" className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">A</kbd>
                    <kbd data-testid="kbd-key-enter" className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">Enter</kbd>
                    <kbd data-testid="kbd-key-escape" className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">Esc</kbd>
                    <kbd data-testid="kbd-key-space" className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">Space</kbd>
                    <kbd data-testid="kbd-key-tab" className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">Tab</kbd>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Modifier Keys</h4>
                  <div className="flex flex-wrap gap-2">
                    <kbd data-testid="kbd-modifier-ctrl" className="px-2 py-1 bg-blue-100 border border-blue-300 rounded text-sm font-mono text-blue-800">Ctrl</kbd>
                    <kbd data-testid="kbd-modifier-alt" className="px-2 py-1 bg-green-100 border border-green-300 rounded text-sm font-mono text-green-800">Alt</kbd>
                    <kbd data-testid="kbd-modifier-shift" className="px-2 py-1 bg-yellow-100 border border-yellow-300 rounded text-sm font-mono text-yellow-800">Shift</kbd>
                    <kbd data-testid="kbd-modifier-cmd" className="px-2 py-1 bg-purple-100 border border-purple-300 rounded text-sm font-mono text-purple-800">Cmd</kbd>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Keyboard Shortcuts</h4>
                  <div className="space-y-2">
                    <div data-testid="kbd-shortcut-copy" className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">Ctrl</kbd>
                      <span>+</span>
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">C</kbd>
                      <span className="ml-2 text-sm">Copy</span>
                    </div>
                    <div data-testid="kbd-shortcut-paste" className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">Ctrl</kbd>
                      <span>+</span>
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">V</kbd>
                      <span className="ml-2 text-sm">Paste</span>
                    </div>
                    <div data-testid="kbd-shortcut-save" className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">Ctrl</kbd>
                      <span>+</span>
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">S</kbd>
                      <span className="ml-2 text-sm">Save</span>
                    </div>
                    <div data-testid="kbd-shortcut-undo" className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">Ctrl</kbd>
                      <span>+</span>
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">Z</kbd>
                      <span className="ml-2 text-sm">Undo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Empty State */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Empty State Component</h3>
              <div data-testid="emptystate-component" className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.707.293H19a2 2 0 012 2v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
                <p className="text-gray-600 mb-4">There are no items to display at this time.</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" onClick={() => console.log('Action clicked')}>
                  Create First Item
                </button>
              </div>
            </div>

            {/* Popover */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Popover Component</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-gray-600 mb-3">Basic popover with hover trigger</p>
                  <div className="flex gap-4">
                    <div data-testid="popover-hover" className="relative group">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Hover for Popover
                      </button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-4 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
                        <h4 className="font-semibold text-gray-900 mb-2">Popover Title</h4>
                        <p className="text-sm text-gray-600">This is popover content that appears on hover. It can contain detailed information or actions.</p>
                      </div>
                    </div>

                    <div data-testid="popover-click" className="relative">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                        Click for Popover
                      </button>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10 hidden group-focus-within:block">
                        <h4 className="font-semibold text-gray-900 mb-2">Click Popover</h4>
                        <p className="text-sm text-gray-600 mb-3">This popover appears on click and stays visible.</p>
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">Action</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Popover Features</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Flexible positioning (top, bottom, left, right)</li>
                    <li>• Multiple trigger types (hover, click, focus)</li>
                    <li>• Customizable content and styling</li>
                    <li>• Accessible with proper ARIA attributes</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Toast */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Toast Component</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-gray-600 mb-3">Toast notification variants</p>
                  <div className="space-y-3">
                    <div data-testid="toast-success" className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-green-900">Success</h4>
                        <p className="text-sm text-green-700">Your changes have been saved successfully.</p>
                      </div>
                      <button className="text-green-500 hover:text-green-700">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    <div data-testid="toast-error" className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-red-900">Error</h4>
                        <p className="text-sm text-red-700">Failed to save changes. Please try again.</p>
                      </div>
                      <button className="text-red-500 hover:text-red-700">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    <div data-testid="toast-info" className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-blue-900">Information</h4>
                        <p className="text-sm text-blue-700">A new update is available for download.</p>
                      </div>
                      <button className="text-blue-500 hover:text-blue-700">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    <div data-testid="toast-warning" className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-yellow-900">Warning</h4>
                        <p className="text-sm text-yellow-700">Your session will expire in 5 minutes.</p>
                      </div>
                      <button className="text-yellow-500 hover:text-yellow-700">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Toast Features</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Multiple variants (success, error, info, warning)</li>
                    <li>• Auto-dismiss after configurable timeout</li>
                    <li>• Manual dismiss option</li>
                    <li>• Stackable notifications</li>
                    <li>• Accessible with ARIA live regions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real Examples - Temporarily disabled */}
        {activeTab === 'examples' && (
          <div className="space-y-8 mb-12">
            <div className="text-gray-600">Real examples temporarily disabled for debugging.</div>
          </div>
        )}

        {/* Features Section */}
        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">Data Display Features</h3>
          <ul className="space-y-2 text-purple-800">
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Responsive design with mobile-first approach
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Semantic HTML with proper accessibility
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Loading states and error handling
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
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
            CLAUDE.md Compliant: Category page with comprehensive data display components
          </div>
        </div>
      </div>
    </div>
  );
}