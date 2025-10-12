/**
 * Test page for real @react-ui-forge components integration.
 * Used to isolate runtime issues with hooks.
 */

'use client';

import React from 'react';
import { useButton } from '@react-ui-forge/core';

/**
 * Real Button component using @react-ui-forge useButton hook.
 * This worked successfully in previous tests.
 */
const TestButton = () => {
  const button = useButton({
    onPress: () => alert('Button clicked!')
  });

  return (
    <button
      {...button.semanticAttributes}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Real @react-ui-forge Button
    </button>
  );
};

export default function TestRealComponentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Real @react-ui-forge Components Test
        </h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Working Component</h2>
          <TestButton />
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">Test Status</h3>
          <p className="text-green-800">
            This page tests real @react-ui-forge component integration.
            If this page builds and renders correctly, it confirms the foundation works.
          </p>
        </div>

        <div className="mt-8">
          <a href="/inputs" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Go to Inputs Page
          </a>
        </div>
      </div>
    </div>
  );
}