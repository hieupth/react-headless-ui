/**
 * Interactive test page with button counter functionality.
 * Follows CLAUDE.md requirements for testing.
 */

'use client';

import { useState } from 'react';

export default function TestInteractivePage() {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    setClickCount(prev => prev + 1);
  };

  const handleReset = () => {
    setClickCount(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Interactive Test Page</h1>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Button Counter Test</h2>

          <div className="mb-4 p-4 bg-gray-100 rounded">
            <p className="text-lg font-medium">Click Count: {clickCount}</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleClick}
              className="button px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
            >
              Clicked
            </button>

            <button
              onClick={handleReset}
              className="button px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium"
            >
              Reset Counter
            </button>

            <button
              disabled
              className="button px-4 py-2 bg-gray-300 text-gray-500 rounded font-medium cursor-not-allowed"
            >
              Disabled Button
            </button>

            <button
              className="button button-loading px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-medium"
              data-loading="true"
            >
              Loading...
            </button>

            <button className="button button-secondary px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium">
              Secondary Button
            </button>
          </div>
        </section>

        <section className="mt-8 p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-semibold text-green-800">Test Status</h3>
          <p className="text-green-700">
            This page provides interactive elements for Selenium testing.
          </p>
        </section>
      </div>
    </div>
  );
}