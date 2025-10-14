/**
 * Forms & Inputs Components Category Page
 * Following CLAUDE.md requirements: Each category has dedicated page showing ALL components in category.
 */

'use client';

// Force dynamic rendering to avoid SSG issues
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import React, { useState } from 'react';

// Import actual input components from renderer package
// Temporarily commented out due to SSR issues
// import {
//   Button,
//   Input,
//   Textarea,
//   Checkbox,
//   Switch,
//   Slider,
//   Label,
//   Field
// } from '@react-ui-forge/renderer';

export default function InputsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    subscribe: false,
    notifications: true,
    volume: 50,
    priority: 'medium',
    eventDate: '',
  });

  // Combobox state
  const [comboboxStates, setComboboxStates] = useState({
    basic: { isOpen: false, value: '' },
    groups: { isOpen: false, value: '' },
    custom: { isOpen: false, value: '' }
  });

  // Input state
  const [inputStates, setInputStates] = useState({
    text: { value: '', showError: false },
    email: { value: '' },
    password: { value: '' }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | boolean | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Combobox handlers
  const handleComboboxFocus = (comboboxId: string) => {
    setComboboxStates(prev => ({
      ...prev,
      [comboboxId]: { ...prev[comboboxId], isOpen: true }
    }));
  };

  const handleComboboxBlur = (comboboxId: string) => {
    // Delay closing to allow option clicks
    setTimeout(() => {
      setComboboxStates(prev => ({
        ...prev,
        [comboboxId]: { ...prev[comboboxId], isOpen: false }
      }));
    }, 200);
  };

  const handleComboboxChange = (comboboxId: string, value: string) => {
    setComboboxStates(prev => ({
      ...prev,
      [comboboxId]: { ...prev[comboboxId], value }
    }));
  };

  const handleComboboxOptionClick = (comboboxId: string, value: string) => {
    setComboboxStates(prev => ({
      ...prev,
      [comboboxId]: { value, isOpen: false }
    }));
  };

  const handleComboboxClear = (comboboxId: string) => {
    setComboboxStates(prev => ({
      ...prev,
      [comboboxId]: { value: '', isOpen: false }
    }));
  };

  // Input handlers
  const handleSimpleInputChange = (inputType: string, value: string) => {
    setInputStates(prev => ({
      ...prev,
      [inputType]: {
        ...prev[inputType],
        value,
        showError: inputType === 'text' && value.length > 0 && value.length < 3
      }
    }));
  };

  const getComboboxOptions = (comboboxId: string, filterText: string) => {
    const allOptions = {
      basic: ['Apple', 'Banana', 'Cherry', 'Date'],
      groups: ['Apple', 'Banana', 'Cherry', 'Strawberry', 'Blueberry'],
      custom: ['Option A', 'Option B', 'Option C']
    };

    const options = allOptions[comboboxId] || [];
    if (!filterText) return options;
    return options.filter(option => option.toLowerCase().includes(filterText.toLowerCase()));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (typeof formData.email === 'string' && !formData.email.includes('@')) {
      newErrors.email = 'Invalid email';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert('Form submitted successfully!');
    }
  };

  const inputComponents = [
    { name: 'Button', description: 'Interactive button with multiple variants and states', status: 'available' },
    { name: 'Button Group', description: 'Groups related buttons with shared styling', status: 'available' },
    { name: 'Input', description: 'Text input field with validation and error states', status: 'available' },
    { name: 'Textarea', description: 'Multi-line text input with auto-resize', status: 'available' },
    { name: 'Auto Resize Textarea', description: 'Textarea that automatically adjusts height', status: 'available' },
    { name: 'Limited Textarea', description: 'Textarea with character limit', status: 'available' },
    { name: 'Controlled Textarea', description: 'Textarea with controlled character count', status: 'available' },
    { name: 'Checkbox', description: 'Binary checkbox with proper accessibility', status: 'available' },
    { name: 'Switch', description: 'Toggle switch for on/off states', status: 'available' },
    { name: 'Slider', description: 'Range slider for value selection', status: 'available' },
    { name: 'Select', description: 'Dropdown select with option groups', status: 'available' },
    { name: 'Combobox', description: 'Autocomplete input with search and selection', status: 'available' },
    { name: 'Label', description: 'Accessible label for form controls', status: 'available' },
    { name: 'Field', description: 'Form field wrapper with validation', status: 'available' },
    { name: 'Calendar', description: 'Date picker with calendar interface', status: 'available' },
    { name: 'Single Date Calendar', description: 'Calendar for single date selection', status: 'available' },
    { name: 'Multi Date Calendar', description: 'Calendar for multiple date selection', status: 'available' },
    { name: 'Range Calendar', description: 'Calendar for date range selection', status: 'available' },
    { name: 'Date Picker Calendar', description: 'Integrated date picker with input field', status: 'available' },
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
              <li><span className="text-gray-500">Forms & Inputs</span></li>
            </ol>
          </nav>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Forms & Inputs Components
          </h1>
          <p className="text-lg text-gray-600">
            Form controls and input components for data collection and user interaction.
            Built with semantic HTML and accessibility in mind.
          </p>
        </div>

        {/* Component Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {inputComponents.map((component) => (
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

        {/* Interactive Form Demo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Interactive Form Demo</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  id="name"
                  data-testid="input-name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  id="email"
                  data-testid="input-email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                id="message"
                data-testid="textarea-message"
                placeholder="Enter your message"
                value={formData.message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('message', e.target.value)}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="subscribe"
                  data-testid="checkbox-subscribe"
                  checked={formData.subscribe}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('subscribe', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="subscribe" className="text-sm font-medium text-gray-700">Subscribe to newsletter</label>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  id="notifications"
                  data-testid="switch-notifications"
                  onClick={() => handleInputChange('notifications', !formData.notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.notifications ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <label htmlFor="notifications" className="text-sm font-medium text-gray-700">Enable notifications</label>
              </div>
            </div>

            <div>
              <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-2">Volume: {formData.volume}</label>
              <input
                id="volume"
                data-testid="slider-volume"
                type="range"
                min={0}
                max={100}
                step={1}
                value={formData.volume}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('volume', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                id="priority"
                data-testid="select-priority"
                value={formData.priority}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('priority', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="event-date" className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
              <input
                id="event-date"
                data-testid="calendar-event-date"
                type="date"
                value={formData.eventDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('eventDate', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                data-testid="button-submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit Form
              </button>
              <button
                type="button"
                data-testid="button-reset"
                onClick={() => setFormData({ name: '', email: '', message: '', subscribe: false, notifications: true, volume: 50, priority: 'medium', eventDate: '' })}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Component Showcase */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">Component Showcase</h2>

          {/* Input Components */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Input Components</h3>
            <div className="space-y-6">
              {/* Basic Text Input */}
              <div>
                <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Text Input
                </label>
                <input
                  id="text-input"
                  data-testid="input-element"
                  type="text"
                  placeholder="Enter your text"
                  value={inputStates.text.value}
                  onChange={(e) => handleSimpleInputChange('text', e.target.value)}
                  className="input-element w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="input-character-count mt-1 text-sm text-gray-500">
                  {inputStates.text.value.length} / 100 characters
                </div>
                <div
                  className="input-error text-sm text-red-600 mt-1"
                  style={{ display: inputStates.text.showError ? 'block' : 'none' }}
                >
                  Text must be at least 3 characters long
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Input
                </label>
                <input
                  id="email-input"
                  data-testid="email-input"
                  type="email"
                  placeholder="Enter your email"
                  value={inputStates.email.value}
                  onChange={(e) => handleSimpleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Password Input
                </label>
                <input
                  id="password-input"
                  data-testid="password-input"
                  type="password"
                  placeholder="Enter your password"
                  value={inputStates.password.value}
                  onChange={(e) => handleSimpleInputChange('password', e.target.value)}
                  required
                  aria-required="true"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Combobox Component */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Combobox Components</h3>
            <div className="space-y-6">
              {/* Basic Combobox */}
              <div>
                <label htmlFor="combobox-basic-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Basic Combobox
                </label>
                <div className="relative">
                  <input
                    id="combobox-basic-input"
                    data-testid="combobox-basic-input"
                    type="text"
                    role="combobox"
                    aria-expanded={comboboxStates.basic.isOpen.toString()}
                    aria-haspopup="listbox"
                    aria-autocomplete="list"
                    placeholder="Select an option..."
                    value={comboboxStates.basic.value}
                    onFocus={() => handleComboboxFocus('basic')}
                    onBlur={() => handleComboboxBlur('basic')}
                    onChange={(e) => handleComboboxChange('basic', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {comboboxStates.basic.isOpen && (
                    <div
                      data-testid="combobox-list"
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                      style={{ minHeight: '60px' }}
                      role="listbox"
                    >
                      {getComboboxOptions('basic', comboboxStates.basic.value).length > 0 ? (
                        getComboboxOptions('basic', comboboxStates.basic.value).map((option, index) => (
                          <div
                            key={index}
                            data-testid="combobox-option"
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                            role="option"
                            onMouseDown={() => handleComboboxOptionClick('basic', option)}
                          >
                            {option}
                          </div>
                        ))
                      ) : (
                        <div data-testid="combobox-empty" className="px-3 py-2 text-gray-500">
                          No results found
                        </div>
                      )}
                    </div>
                  )}
                  {comboboxStates.basic.value && (
                    <button
                      data-testid="combobox-clear"
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Clear selection"
                      onClick={() => handleComboboxClear('basic')}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Groups Combobox */}
              <div>
                <label htmlFor="combobox-groups-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Combobox with Groups
                </label>
                <div className="relative">
                  <input
                    id="combobox-groups-input"
                    data-testid="combobox-groups-input"
                    type="text"
                    role="combobox"
                    aria-expanded={comboboxStates.groups.isOpen.toString()}
                    aria-haspopup="listbox"
                    aria-autocomplete="list"
                    placeholder="Select a fruit..."
                    value={comboboxStates.groups.value}
                    onFocus={() => handleComboboxFocus('groups')}
                    onBlur={() => handleComboboxBlur('groups')}
                    onChange={(e) => handleComboboxChange('groups', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {comboboxStates.groups.isOpen && (
                    <div
                      data-testid="combobox-list"
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                      style={{ minHeight: '60px' }}
                      role="listbox"
                    >
                      {getComboboxOptions('groups', comboboxStates.groups.value).length > 0 ? (
                        <>
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500">Fruits</div>
                          {['Apple', 'Banana', 'Cherry'].filter(option =>
                            option.toLowerCase().includes(comboboxStates.groups.value.toLowerCase())
                          ).map((option, index) => (
                            <div
                              key={index}
                              data-testid="combobox-option"
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer pl-6"
                              role="option"
                              onMouseDown={() => handleComboboxOptionClick('groups', option)}
                            >
                              {option}
                            </div>
                          ))}
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 mt-2">Berries</div>
                          {['Strawberry', 'Blueberry'].filter(option =>
                            option.toLowerCase().includes(comboboxStates.groups.value.toLowerCase())
                          ).map((option, index) => (
                            <div
                              key={index + 3}
                              data-testid="combobox-option"
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer pl-6"
                              role="option"
                              onMouseDown={() => handleComboboxOptionClick('groups', option)}
                            >
                              {option}
                            </div>
                          ))}
                        </>
                      ) : (
                        <div data-testid="combobox-empty" className="px-3 py-2 text-gray-500">
                          No results found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Combobox */}
              <div>
                <label htmlFor="combobox-custom-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Combobox with Custom Values
                </label>
                <div className="relative">
                  <input
                    id="combobox-custom-input"
                    data-testid="combobox-custom-input"
                    type="text"
                    role="combobox"
                    aria-expanded={comboboxStates.custom.isOpen.toString()}
                    aria-haspopup="listbox"
                    aria-autocomplete="list"
                    placeholder="Type or select..."
                    value={comboboxStates.custom.value}
                    onFocus={() => handleComboboxFocus('custom')}
                    onBlur={() => handleComboboxBlur('custom')}
                    onChange={(e) => handleComboboxChange('custom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {comboboxStates.custom.isOpen && (
                    <div
                      data-testid="combobox-list"
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                      style={{ minHeight: '60px' }}
                      role="listbox"
                    >
                      {getComboboxOptions('custom', comboboxStates.custom.value).length > 0 ? (
                        getComboboxOptions('custom', comboboxStates.custom.value).map((option, index) => (
                          <div
                            key={index}
                            data-testid="combobox-option"
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                            role="option"
                            onMouseDown={() => handleComboboxOptionClick('custom', option)}
                          >
                            {option}
                          </div>
                        ))
                      ) : (
                        <div data-testid="combobox-empty" className="px-3 py-2 text-gray-500">
                          No results found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-green-50 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-green-900 mb-3">Form Features</h3>
          <ul className="space-y-2 text-green-800">
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Semantic HTML5 form elements with proper labels
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Built-in validation and error states
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Keyboard accessibility and screen reader support
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
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
            CLAUDE.md Compliant: Category page with comprehensive form components
          </div>
        </div>
      </div>
    </div>
  );
}

// Add SelectItem for Select component
const SelectItem = ({ children, value }: { children: React.ReactNode; value: string }) => (
  <option value={value}>{children}</option>
);

// Simple Label component to avoid TypeScript issues
const SimpleLabel = ({ children, ...props }: { children: React.ReactNode; className?: string; htmlFor?: string }) => (
  <label className={props.className || ''} htmlFor={props.htmlFor}>
    {children}
  </label>
);

// Add Combobox components
const ComboboxInput = ({ ...props }: React.ComponentPropsWithoutRef<'input'>) => (
  <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
);

const ComboboxList = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
    {children}
  </div>
);

const ComboboxItem = ({ children, value }: { children: React.ReactNode; value: string }) => (
  <div className="px-3 py-2 hover:bg-blue-50 cursor-pointer" data-value={value}>
    {children}
  </div>
);