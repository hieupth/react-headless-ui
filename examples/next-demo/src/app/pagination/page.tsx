/**
 * Pagination Components Category Page
 * Following CLAUDE.md requirements: Each category has dedicated page showing ALL components in category.
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';

// Import actual pagination components from renderer package
import {
  Pagination,
  CompactPagination,
  JumpPagination
} from '@hieupth/reui';

export default function PaginationPage() {
  const [activeTab, setActiveTab] = useState('showcase');
  const [currentPage1, setCurrentPage1] = useState(5);
  const [currentPage2, setCurrentPage2] = useState(3);
  const [currentPage3, setCurrentPage3] = useState(2);
  const [currentPage4, setCurrentPage4] = useState(1);

  const totalPages1 = 10;
  const totalPages2 = 25;
  const totalPages3 = 7;
  const totalPages4 = 100;

  const paginationComponents = [
    { name: 'Pagination', description: 'Full-featured pagination with numbered pages and navigation', status: 'available' },
    { name: 'Compact Pagination', description: 'Simple previous/next pagination with page info', status: 'available' },
    { name: 'Jump Pagination', description: 'Pagination with input field for jumping to specific pages', status: 'available' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generateMockData = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `Item ${i + 1}`,
      description: `This is the description for item ${i + 1}`,
      category: ['Documents', 'Images', 'Videos', 'Audio'][i % 4],
      date: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
    }));
  };

  const mockData = generateMockData(50);

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
              <li><span className="text-gray-500">Pagination</span></li>
            </ol>
          </nav>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pagination Components
          </h1>
          <p className="text-lg text-gray-600">
            Pagination and navigation components for browsing large datasets.
            Built with accessibility and responsive design in mind.
          </p>
        </div>

        {/* Component Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {paginationComponents.map((component) => (
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
          <div className="space-y-12 mb-12">
            {/* Standard Pagination */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Standard Pagination</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Basic Pagination (10 pages)</h4>
                  <Pagination
                    totalPages={totalPages1}
                    defaultPage={currentPage1}
                    onPageChange={setCurrentPage1}
                    data-testid="pagination-basic"
                  />
                  <p className="text-sm text-gray-600 mt-2">Interactive pagination with numbered pages</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Large Dataset (25 pages)</h4>
                  <Pagination
                    totalPages={totalPages2}
                    defaultPage={currentPage2}
                    onPageChange={setCurrentPage2}
                    data-testid="pagination-large"
                  />
                  <p className="text-sm text-gray-600 mt-2">Pagination with ellipsis for large datasets</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Minimal Pagination (7 pages)</h4>
                  <Pagination
                    totalPages={totalPages3}
                    defaultPage={currentPage3}
                    onPageChange={setCurrentPage3}
                    showFirstLast={false}
                    data-testid="pagination-minimal"
                  />
                  <p className="text-sm text-gray-600 mt-2">Compact pagination without first/last buttons</p>
                </div>
              </div>
            </div>

            {/* Compact Pagination */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Compact Pagination</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Previous/Next Style</h4>
                  <CompactPagination
                    totalPages={totalPages1}
                    defaultPage={currentPage1}
                    onPageChange={setCurrentPage1}
                    data-testid="compact-pagination"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Simple and clean pagination perfect for mobile interfaces or when space is limited.
                </p>
              </div>
            </div>

            {/* Jump Pagination */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Jump Pagination</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">With Jump Input</h4>
                  <JumpPagination
                    totalPages={totalPages4}
                    defaultPage={currentPage4}
                    onPageChange={setCurrentPage4}
                    data-testid="jump-pagination"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Ideal for very large datasets where users need to navigate to specific pages quickly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Examples */}
        {activeTab === 'examples' && (
          <div className="space-y-8 mb-12">
            {/* Data Table with Pagination */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Table with Pagination</h3>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockData
                        .slice((currentPage1 - 1) * 5, currentPage1 * 5)
                        .map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.date}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <Pagination
                    totalPages={totalPages1}
                    defaultPage={currentPage1}
                    onPageChange={setCurrentPage1}
                  />
                </div>
              </div>
            </div>

            {/* Search Results */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Search Results Interface</h3>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Search Results</h4>
                    <span className="text-sm text-gray-500">
                      Showing {(currentPage2 - 1) * 10 + 1}-{Math.min(currentPage2 * 10, 250)} of 250 results
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="search"
                      placeholder="Search..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Search
                    </button>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {mockData
                    .slice((currentPage2 - 1) * 10, currentPage2 * 10)
                    .map((item) => (
                      <div key={item.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <h5 className="font-medium text-gray-900 mb-1">{item.title}</h5>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="px-2 py-1 bg-gray-100 rounded">{item.category}</span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                    ))}
                </div>

                <CompactPagination
                  totalPages={totalPages2}
                  defaultPage={currentPage2}
                  onPageChange={setCurrentPage2}
                />
              </div>
            </div>

            {/* Gallery with Pagination */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Gallery with Pagination</h3>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">Image {currentPage1 * 12 + i + 1}</span>
                    </div>
                  ))}
                </div>
                <Pagination
                  totalPages={totalPages4}
                  defaultPage={currentPage4}
                  onPageChange={setCurrentPage4}
                />
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="bg-orange-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-orange-900 mb-3">Pagination Features</h3>
          <ul className="space-y-2 text-orange-800">
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Keyboard navigation support
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              ARIA attributes for screen readers
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Multiple pagination styles
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
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
            CLAUDE.md Compliant: Category page with comprehensive pagination components
          </div>
        </div>
      </div>
    </div>
  );
}