/**
 * Interactive test page with all components for testing.
 * Follows CLAUDE.md requirements for testing.
 */

'use client';

import { useState, useEffect } from 'react';

export default function TestInteractivePage() {
  const [clickCount, setClickCount] = useState(0);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [textareaValue, setTextareaValue] = useState('');
  const [togglePressed, setTogglePressed] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [fieldValues, setFieldValues] = useState({
    text: '',
    email: '',
    password: '',
    search: '',
    amount: '',
    required: '',
    limited: ''
  });
  const [fileUploadValues, setFileUploadValues] = useState({
    single: '',
    multiple: '',
    basic: ''
  });

  // Context menu state
  const [contextMenuStates, setContextMenuStates] = useState({
    basic: { isOpen: false, x: 0, y: 0 },
    checkbox: { isOpen: false, x: 0, y: 0 },
    icons: { isOpen: false, x: 0, y: 0 }
  });

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClick = () => {
    setClickCount(prev => prev + 1);
  };

  const handleReset = () => {
    setClickCount(0);
  };

  const handleCheckboxChange = () => {
    setCheckboxChecked(!checkboxChecked);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextareaValue(e.target.value);
  };

  const handleToggleClick = () => {
    setTogglePressed(!togglePressed);
  };

  const handleAlertDialogOpen = () => {
    setAlertDialogOpen(true);
  };

  const handleAlertDialogClose = () => {
    setAlertDialogOpen(false);
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleFileChange = (uploadId: string, files: FileList | null) => {
    if (files && files.length > 0) {
      const fileNames = Array.from(files).map(f => f.name).join(', ');
      setFileUploadValues(prev => ({
        ...prev,
        [uploadId]: fileNames
      }));
    }
  };

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent, menuType: string) => {
    e.preventDefault();
    setContextMenuStates(prev => ({
      ...prev,
      [menuType]: { isOpen: true, x: e.clientX, y: e.clientY }
    }));
  };

  const closeContextMenu = (menuType: string) => {
    setContextMenuStates(prev => {
      const key = menuType as keyof typeof prev;
      return {
        ...prev,
        [key]: { ...prev[key], isOpen: false }
      };
    });
  };

  const closeAllContextMenus = () => {
    setContextMenuStates(prev => ({
      basic: { ...prev.basic, isOpen: false },
      checkbox: { ...prev.checkbox, isOpen: false },
      icons: { ...prev.icons, isOpen: false }
    }));
  };

  const handleContextMenuItemClick = (menuType: string, action: string) => {
    console.log(`Context menu action: ${action} from ${menuType} menu`);
    closeContextMenu(menuType);
  };

  // Dialog handlers
  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDialogConfirm = () => {
    alert('Dialog confirmed!');
    setDialogOpen(false);
  };

  const handleDialogCancel = () => {
    alert('Dialog cancelled!');
    setDialogOpen(false);
  };

  // Global Escape key handler
  useEffect(() => {
    const handleGlobalEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllContextMenus();
        setDialogOpen(false);
      }
    };

    document.addEventListener('keydown', handleGlobalEscape);
    return () => {
      document.removeEventListener('keydown', handleGlobalEscape);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8" onClick={closeAllContextMenus} onKeyDown={(e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAllContextMenus();
      }
    }} tabIndex={-1} style={{ outline: 'none' }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Interactive Test Page</h1>

        {/* Checkbox Component */}
        <section className="mb-8 space-y-4">
          <h2 className="text-xl font-semibold">Checkbox Component</h2>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              data-testid="checkbox"
              id="test-checkbox"
              checked={checkboxChecked}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="test-checkbox" className="text-sm font-medium text-gray-700">
              Test Checkbox
            </label>
          </div>
        </section>

        {/* Field Components */}
        <section className="mb-8 space-y-4">
          <h2 className="text-xl font-semibold">Field Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="field-text" className="block text-sm font-medium text-gray-700 mb-1">
                Text Field
              </label>
              <input
                type="text"
                id="field-text"
                data-testid="field-text"
                value={fieldValues.text}
                onChange={(e) => handleFieldChange('text', e.target.value)}
                placeholder="Enter your name"
                aria-label="Name input"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="field-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Field
              </label>
              <input
                type="email"
                id="field-email"
                data-testid="field-email"
                value={fieldValues.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="field-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password Field
              </label>
              <input
                type="password"
                id="field-password"
                data-testid="field-password"
                value={fieldValues.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="field-search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Field
              </label>
              <input
                type="search"
                id="field-search"
                data-testid="field-search"
                value={fieldValues.search}
                onChange={(e) => handleFieldChange('search', e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="field-amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount Field
              </label>
              <input
                type="number"
                id="field-amount"
                data-testid="field-amount"
                value={fieldValues.amount}
                onChange={(e) => handleFieldChange('amount', e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="field-required" className="block text-sm font-medium text-gray-700 mb-1">
                Required Field *
              </label>
              <input
                type="text"
                id="field-required"
                data-testid="field-required"
                value={fieldValues.required}
                onChange={(e) => handleFieldChange('required', e.target.value)}
                placeholder="This field is required"
                aria-required={true}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="field-limited" className="block text-sm font-medium text-gray-700 mb-1">
                Limited Field (50 chars)
              </label>
              <input
                type="text"
                id="field-limited"
                data-testid="field-limited"
                value={fieldValues.limited}
                onChange={(e) => handleFieldChange('limited', e.target.value.slice(0, 50))}
                placeholder="Maximum 50 characters"
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="field-disabled" className="block text-sm font-medium text-gray-700 mb-1">
                Disabled Field
              </label>
              <input
                type="text"
                id="field-disabled"
                data-testid="field-disabled"
                value="This field is disabled"
                disabled
                aria-disabled={true}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </section>

        {/* Textarea Component */}
        <section className="mb-8 space-y-4">
          <h2 className="text-xl font-semibold">Textarea Component</h2>
          <textarea
            data-testid="textarea"
            value={textareaValue}
            onChange={handleTextareaChange}
            placeholder="Enter text here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
        </section>

        {/* File Upload Components */}
        <section className="mb-8 space-y-4">
          <h2 className="text-xl font-semibold">File Upload Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Single File Upload
              </label>
              <div
                data-testid="file-upload-single"
                role="button"
                aria-label="Upload files"
                tabIndex={0}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={() => document.getElementById('file-single-input')?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    document.getElementById('file-single-input')?.click();
                  }
                }}
              >
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">Single file only</p>
                </div>
                {fileUploadValues.single && (
                  <p className="mt-2 text-sm text-green-600">Selected: {fileUploadValues.single}</p>
                )}
              </div>
              <input
                id="file-single-input"
                type="file"
                className="hidden"
                onChange={(e) => handleFileChange('single', e.target.files)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Multiple File Upload
              </label>
              <div
                data-testid="file-upload-multiple"
                role="button"
                aria-label="Upload multiple files"
                tabIndex={0}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={() => document.getElementById('file-multiple-input')?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    document.getElementById('file-multiple-input')?.click();
                  }
                }}
              >
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">Multiple files allowed</p>
                </div>
                {fileUploadValues.multiple && (
                  <p className="mt-2 text-sm text-green-600">Selected: {fileUploadValues.multiple}</p>
                )}
              </div>
              <input
                id="file-multiple-input"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileChange('multiple', e.target.files)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Basic File Upload
              </label>
              <div
                data-testid="file-upload-basic"
                role="button"
                aria-label="Upload files"
                tabIndex={0}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={() => document.getElementById('file-basic-input')?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    document.getElementById('file-basic-input')?.click();
                  }
                }}
              >
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Click to upload</p>
                  <p className="text-xs text-gray-500">Any file type</p>
                </div>
                {fileUploadValues.basic && (
                  <p className="mt-2 text-sm text-green-600">Selected: {fileUploadValues.basic}</p>
                )}
              </div>
              <input
                id="file-basic-input"
                type="file"
                className="hidden"
                onChange={(e) => handleFileChange('basic', e.target.files)}
              />
            </div>
          </div>
        </section>

        {/* Toggle Component */}
        <section className="mb-8 space-y-4">
          <h2 className="text-xl font-semibold">Toggle Component</h2>
          <div
            data-testid="toggle"
            role="switch"
            aria-checked={togglePressed}
            aria-pressed={togglePressed}
            data-pressed={togglePressed.toString()}
            onClick={handleToggleClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggleClick();
              }
            }}
            tabIndex={0}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer ${
              togglePressed ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className="sr-only">Toggle setting</span>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                togglePressed ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </div>
        </section>

        {/* Calendar Component */}
        <section className="mb-8 space-y-4">
          <h2 className="text-xl font-semibold">Calendar Component</h2>
          <div
            data-testid="calendar"
            className="p-4 border border-gray-300 rounded-lg bg-white"
            style={{ minWidth: '300px', minHeight: '300px' }}
          >
            <div className="text-center font-medium mb-4">December 2024</div>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={`day-${index}`} className="text-center font-semibold p-2">{day}</div>
              ))}
              {Array.from({ length: 31 }, (_, i) => (
                <div key={`date-${i}`} className="text-center p-2 hover:bg-gray-100 cursor-pointer rounded">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Button Group Component */}
        <section className="mb-8 space-y-4">
          <h2 className="text-xl font-semibold">Button Group Component</h2>
          <div
            data-testid="button-group"
            className="inline-flex rounded-md border border-gray-300 bg-white"
            role="group"
          >
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border-r border-gray-300">
              Left
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border-r border-gray-300">
              Middle
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Right
            </button>
          </div>
        </section>

        {/* Alert Dialog Component */}
        <section className="mb-8 space-y-4">
          <h2 className="text-xl font-semibold">Alert Dialog Component</h2>
          <button
            data-testid="alert-dialog-trigger"
            onClick={handleAlertDialogOpen}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Open Alert Dialog
          </button>

          {alertDialogOpen && (
            <div
              data-testid="alert-dialog"
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            >
              <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                <h3 className="text-lg font-semibold mb-4">Alert Dialog</h3>
                <p className="text-gray-600 mb-6">This is an alert dialog for testing purposes.</p>
                <button
                  onClick={handleAlertDialogClose}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Carousel Component */}
        <section className="mb-8 space-y-4">
          <h2 className="text-xl font-semibold">Carousel Component</h2>
          <div
            data-testid="carousel"
            className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden"
            style={{ minWidth: '400px' }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-gray-600">
              <div className="text-center">
                <div className="text-4xl mb-2">🎠</div>
                <p>Carousel Slide 1</p>
              </div>
            </div>
            <button className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md">
              ‹
            </button>
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md">
              ›
            </button>
          </div>
        </section>

        {/* Context Menu Components */}
        <section className="mb-8 space-y-4">
          <h2 className="text-xl font-semibold">Context Menu Components</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Basic Context Menu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Basic Context Menu (Right-click)
              </label>
              <div
                data-testid="context-menu-basic-trigger"
                onContextMenu={(e) => handleContextMenu(e, 'basic')}
                className="p-4 bg-blue-100 border border-blue-300 rounded-lg cursor-pointer hover:bg-blue-200 text-center"
                style={{ userSelect: 'none' }}
              >
                Right-click me
              </div>
            </div>

            {/* Checkbox Context Menu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Checkbox Context Menu (Right-click)
              </label>
              <div
                data-testid="context-menu-checkbox-trigger"
                onContextMenu={(e) => handleContextMenu(e, 'checkbox')}
                className="p-4 bg-green-100 border border-green-300 rounded-lg cursor-pointer hover:bg-green-200 text-center"
                style={{ userSelect: 'none' }}
              >
                Right-click for options
              </div>
            </div>

            {/* Icons Context Menu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icons Context Menu (Right-click)
              </label>
              <div
                data-testid="context-menu-icons-trigger"
                onContextMenu={(e) => handleContextMenu(e, 'icons')}
                className="p-4 bg-purple-100 border border-purple-300 rounded-lg cursor-pointer hover:bg-purple-200 text-center"
                style={{ userSelect: 'none' }}
              >
                Right-click for icons
              </div>
            </div>
          </div>

          {/* Basic Context Menu */}
          {contextMenuStates.basic.isOpen && (
            <div
              data-testid="context-menu-basic"
              className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]"
              style={{ left: contextMenuStates.basic.x, top: contextMenuStates.basic.y }}
              role="menu"
              aria-label="Context menu"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                role="menuitem"
                tabIndex={-1}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleContextMenuItemClick('basic', 'cut')}
              >
                Cut
              </div>
              <div
                role="menuitem"
                tabIndex={-1}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleContextMenuItemClick('basic', 'copy')}
              >
                Copy
              </div>
              <div
                role="menuitem"
                tabIndex={-1}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleContextMenuItemClick('basic', 'paste')}
              >
                Paste
              </div>
              <div
                role="menuitem"
                tabIndex={-1}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleContextMenuItemClick('basic', 'delete')}
              >
                Delete
              </div>
            </div>
          )}

          {/* Checkbox Context Menu */}
          {contextMenuStates.checkbox.isOpen && (
            <div
              data-testid="context-menu-checkbox"
              className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]"
              style={{ left: contextMenuStates.checkbox.x, top: contextMenuStates.checkbox.y }}
              role="menu"
              aria-label="Context menu"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                role="menuitem"
                tabIndex={-1}
                aria-checked={false}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                onClick={() => handleContextMenuItemClick('checkbox', 'show-hidden')}
              >
                <span className="w-4 h-4 border border-gray-300 rounded"></span>
                Show Hidden Files
              </div>
              <div
                role="menuitem"
                tabIndex={-1}
                aria-checked={true}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                onClick={() => handleContextMenuItemClick('checkbox', 'auto-arrange')}
              >
                <span className="w-4 h-4 border border-gray-300 rounded bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </span>
                Auto Arrange
              </div>
              <div
                role="menuitem"
                tabIndex={-1}
                aria-checked={false}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                onClick={() => handleContextMenuItemClick('checkbox', 'grid-view')}
              >
                <span className="w-4 h-4 border border-gray-300 rounded"></span>
                Grid View
              </div>
              <div
                role="menuitem"
                tabIndex={-1}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleContextMenuItemClick('checkbox', 'refresh')}
              >
                Refresh
              </div>
            </div>
          )}

          {/* Icons Context Menu */}
          {contextMenuStates.icons.isOpen && (
            <div
              data-testid="context-menu-icons"
              className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]"
              style={{ left: contextMenuStates.icons.x, top: contextMenuStates.icons.y }}
              role="menu"
              aria-label="Context menu"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                role="menuitem"
                tabIndex={-1}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                onClick={() => handleContextMenuItemClick('icons', 'open')}
              >
                <span className="text-blue-500">📁</span>
                Open
              </div>
              <div
                role="menuitem"
                tabIndex={-1}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                onClick={() => handleContextMenuItemClick('icons', 'edit')}
              >
                <span className="text-green-500">✏️</span>
                Edit
              </div>
              <div
                role="menuitem"
                tabIndex={-1}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                onClick={() => handleContextMenuItemClick('icons', 'share')}
              >
                <span className="text-purple-500">🔗</span>
                Share
              </div>
              <div
                role="menuitem"
                tabIndex={-1}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                onClick={() => handleContextMenuItemClick('icons', 'delete')}
              >
                <span className="text-red-500">🗑️</span>
                Delete
              </div>
            </div>
          )}
        </section>

        {/* Dialog Component */}
        <section className="mb-8 space-y-4">
          <h2 className="text-xl font-semibold">Dialog Component</h2>

          <button
            onClick={handleDialogOpen}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Open Dialog
          </button>

          {dialogOpen && (
            <>
              {/* Dialog Overlay */}
              <div
                className="dialog-overlay fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={handleDialogClose}
              />

              {/* Dialog Content */}
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="dialog-content bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto"
                  style={{ width: '600px' }}
                  role="dialog"
                  aria-modal={true}
                  aria-labelledby="dialog-title"
                >
                  {/* Dialog Header */}
                  <div className="dialog-title flex items-center justify-between p-6 border-b">
                    <h3 id="dialog-title" className="text-lg font-semibold text-gray-900">
                      Dialog Title
                    </h3>
                    <button
                      className="dialog-close-button text-gray-400 hover:text-gray-600"
                      onClick={handleDialogClose}
                      aria-label="Close dialog"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Dialog Body */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">
                      This is a dialog component for testing purposes. It includes proper accessibility attributes and keyboard navigation.
                    </p>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sample Input
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter some text..."
                      />
                    </div>
                  </div>

                  {/* Dialog Footer */}
                  <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                    <button
                      onClick={handleDialogCancel}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDialogConfirm}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Button Counter Test */}
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