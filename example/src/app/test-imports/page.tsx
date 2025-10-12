/**
 * Test page to verify @react-ui-forge component imports work
 * Following CLAUDE.md architecture patterns.
 */

'use client';

import React from 'react';

// Test imports from our packages
const TestImportsPage = () => {
  const [importStatus, setImportStatus] = React.useState({
    gateway: false,
    core: false,
    renderer: false,
    theme: false,
    button: false,
    dropdown: false,
  });

  React.useEffect(() => {
    const testImports = async () => {
      try {
        // Test individual packages first
        const core = await import('@react-ui-forge/core');
        console.log('✅ Core package imported:', Object.keys(core));
        setImportStatus(prev => ({ ...prev, core: true }));

        // Test gateway package (main entry point) - skip for now due to missing hooks
        console.warn('⚠️ Skipping gateway import - depends on renderer which has missing hooks');
        setImportStatus(prev => ({ ...prev, gateway: false }));

        // Test renderer package directly - skip for now due to missing hooks
        console.warn('⚠️ Skipping renderer import - some components have missing hooks');
        setImportStatus(prev => ({ ...prev, renderer: false }));

        // Test some core hooks that should work
        try {
          if (core.useButton) {
            setImportStatus(prev => ({ ...prev, button: true }));
          }
          if (core.useDropdownMenu) {
            setImportStatus(prev => ({ ...prev, dropdown: true }));
          }
        } catch (hookError) {
          console.warn('⚠️ Hook access failed:', hookError instanceof Error ? hookError.message : String(hookError));
        }

      } catch (error) {
        console.error('❌ Core import failed:', error);
        if (error instanceof Error) {
          console.error('Stack:', error.stack);
        }
      }
    };

    testImports();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Component Import Test
        </h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Import Status
          </h2>

          <div className="space-y-2">
            <div className={`flex items-center gap-2 ${importStatus.gateway ? 'text-green-600' : 'text-red-600'}`}>
              <span>{importStatus.gateway ? '✅' : '❌'}</span>
              Gateway Package: {importStatus.gateway ? 'Available' : 'Failed'}
            </div>

            <div className={`flex items-center gap-2 ${importStatus.core ? 'text-green-600' : 'text-red-600'}`}>
              <span>{importStatus.core ? '✅' : '❌'}</span>
              Core Package: {importStatus.core ? 'Available' : 'Failed'}
            </div>

            <div className={`flex items-center gap-2 ${importStatus.renderer ? 'text-green-600' : 'text-red-600'}`}>
              <span>{importStatus.renderer ? '✅' : '❌'}</span>
              Renderer Package: {importStatus.renderer ? 'Available' : 'Failed'}
            </div>

            <div className={`flex items-center gap-2 ${importStatus.button ? 'text-green-600' : 'text-red-600'}`}>
              <span>{importStatus.button ? '✅' : '❌'}</span>
              useButton Hook: {importStatus.button ? 'Available' : 'Failed'}
            </div>

            <div className={`flex items-center gap-2 ${importStatus.dropdown ? 'text-green-600' : 'text-red-600'}`}>
              <span>{importStatus.dropdown ? '✅' : '❌'}</span>
              useDropdownMenu Hook: {importStatus.dropdown ? 'Available' : 'Failed'}
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              Check browser console for detailed import information.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <a href="/navigation" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Go to Navigation Page
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestImportsPage;