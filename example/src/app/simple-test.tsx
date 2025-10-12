'use client';

import React from 'react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            React UI Forge - Simple Test
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Basic test page for component verification
          </p>
        </header>

        <main>
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Basic Elements</h2>

            {/* Test Button */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Button</h3>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
                onClick={() => alert('Button clicked!')}
              >
                Click me
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded mr-2"
                disabled
              >
                Disabled
              </button>
            </div>

            {/* Test Input */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Input Fields</h3>
              <input
                type="text"
                placeholder="Text input"
                className="border border-gray-300 px-3 py-2 rounded mr-2"
              />
              <input
                type="email"
                placeholder="Email input"
                className="border border-gray-300 px-3 py-2 rounded mr-2"
              />
            </div>

            {/* Test Checkbox */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Checkbox</h3>
              <label className="mr-4">
                <input type="checkbox" className="mr-2" />
                Option 1
              </label>
              <label className="mr-4">
                <input type="checkbox" className="mr-2" defaultChecked />
                Option 2 (checked)
              </label>
            </div>

            {/* Test Select */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Select</h3>
              <select className="border border-gray-300 px-3 py-2 rounded mr-2">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>

            {/* Test Textarea */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Textarea</h3>
              <textarea
                placeholder="Enter your message..."
                className="border border-gray-300 px-3 py-2 rounded w-full h-24"
              />
            </div>

            {/* Test Links */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Links</h3>
              <a href="#test1" className="text-blue-500 hover:text-blue-600 underline mr-4">
                Link 1
              </a>
              <a href="#test2" className="text-blue-500 hover:text-blue-600 underline mr-4">
                Link 2
              </a>
            </div>

            {/* Test Images */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Images</h3>
              <div className="w-16 h-16 bg-gray-200 rounded mr-4 inline-flex items-center justify-center text-gray-500">
                IMG
              </div>
              <span className="text-gray-600">Placeholder image</span>
            </div>

          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Test Results</h2>
            <div id="test-results" className="bg-white p-6 rounded-lg shadow-sm border">
              <p className="text-gray-600">Test results will appear here...</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}