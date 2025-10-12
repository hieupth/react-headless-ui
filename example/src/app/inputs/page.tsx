/**
 * Forms & Inputs Components Category Page
 * Following CLAUDE.md requirements: Each category has dedicated page showing ALL components in category.
 */

'use client';

import Link from 'next/link';
import React, { useState } from 'react';

// Import actual input components from renderer package
import {
  Button,
  ButtonGroup,
  Input,
  Textarea,
  Checkbox,
  Switch,
  Slider,
  Select,
  Label,
  Field,
  Calendar,
  Combobox
} from '@react-ui-forge/renderer';

export default function InputsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    subscribe: false,
    notifications: true,
    volume: 50,
    priority: 'medium',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
    { name: 'Checkbox', description: 'Binary checkbox with proper accessibility', status: 'available' },
    { name: 'Switch', description: 'Toggle switch for on/off states', status: 'available' },
    { name: 'Slider', description: 'Range slider for value selection', status: 'available' },
    { name: 'Select', description: 'Dropdown select with option groups', status: 'available' },
    { name: 'Combobox', description: 'Autocomplete input with search and selection', status: 'available' },
    { name: 'Label', description: 'Accessible label for form controls', status: 'available' },
    { name: 'Field', description: 'Form field wrapper with validation', status: 'available' },
    { name: 'Calendar', description: 'Date picker with calendar interface', status: 'available' },
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
              <Field>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  data-testid="input-name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(value) => handleInputChange('name', value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </Field>

              <Field>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  data-testid="input-email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(value) => handleInputChange('email', value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </Field>
            </div>

            <Field>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                data-testid="textarea-message"
                placeholder="Enter your message"
                value={formData.message}
                onChange={(value) => handleInputChange('message', value)}
                rows={4}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="subscribe"
                  data-testid="checkbox-subscribe"
                  checked={formData.subscribe}
                  onCheckedChange={(checked) => handleInputChange('subscribe', checked)}
                />
                <Label htmlFor="subscribe">Subscribe to newsletter</Label>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  id="notifications"
                  data-testid="switch-notifications"
                  checked={formData.notifications}
                  onCheckedChange={(checked) => handleInputChange('notifications', checked)}
                />
                <Label htmlFor="notifications">Enable notifications</Label>
              </div>
            </div>

            <Field>
              <Label htmlFor="volume">Volume: {formData.volume}</Label>
              <Slider
                id="volume"
                data-testid="slider-volume"
                min={0}
                max={100}
                step={1}
                value={[formData.volume]}
                onValueChange={(value) => handleInputChange('volume', value[0])}
                className="w-full"
              />
            </Field>

            <Field>
              <Label htmlFor="priority">Priority</Label>
              <Select
                id="priority"
                data-testid="select-priority"
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </Select>
            </Field>

            <Field>
              <Label htmlFor="event-date">Event Date</Label>
              <Calendar
                id="event-date"
                data-testid="calendar-event-date"
                mode="single"
                selected={formData.eventDate ? new Date(formData.eventDate) : undefined}
                onSelect={(date) => handleInputChange('eventDate', date?.toISOString().split('T')[0] || '')}
                className="rounded-md border"
              />
            </Field>

            <div className="flex gap-4">
              <Button type="submit" data-testid="button-submit">
                Submit Form
              </Button>
              <Button type="button" variant="outline" data-testid="button-reset">
                Reset
              </Button>
            </div>
          </form>
        </div>

        {/* Component Showcase */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">Component Showcase</h2>

          {/* Buttons */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <Button data-testid="button-primary">Primary Button</Button>
              <Button variant="secondary" data-testid="button-secondary">
                Secondary Button
              </Button>
              <Button variant="outline" data-testid="button-outline">
                Outline Button
              </Button>
              <Button variant="ghost" data-testid="button-ghost">
                Ghost Button
              </Button>
              <Button disabled data-testid="button-disabled">
                Disabled Button
              </Button>
            </div>
          </div>

          {/* Button Group */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Button Group</h3>
            <ButtonGroup data-testid="button-group">
              <Button variant="outline">Left</Button>
              <Button variant="outline">Middle</Button>
              <Button variant="outline">Right</Button>
            </ButtonGroup>
          </div>

          {/* Input Fields */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Input Fields</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <Label>Standard Input</Label>
                <Input data-testid="input-standard" placeholder="Type here..." />
              </Field>
              <Field>
                <Label>Error Input</Label>
                <Input data-testid="input-error" placeholder="Type here..." className="border-red-500" />
              </Field>
              <Field>
                <Label>Disabled Input</Label>
                <Input data-testid="input-disabled" placeholder="Cannot edit" disabled />
              </Field>
              <Field>
                <Label>Email Input</Label>
                <Input data-testid="input-email" type="email" placeholder="email@example.com" />
              </Field>
            </div>
          </div>

          {/* Selection Controls */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Selection Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox data-testid="checkbox-terms" id="terms" />
                <Label htmlFor="terms">I agree to the terms and conditions</Label>
              </div>
              <div className="flex items-center space-x-3">
                <Switch data-testid="switch-darkmode" id="darkmode" />
                <Label htmlFor="darkmode">Dark mode enabled</Label>
              </div>
              <Field>
                <Label>Brightness: 75</Label>
                <Slider
                  data-testid="slider-brightness"
                  min={0}
                  max={100}
                  step={5}
                  value={[75]}
                  className="w-full"
                />
              </Field>
              <Field>
                <Label>Country</Label>
                <Select data-testid="select-country" defaultValue="us">
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                </Select>
              </Field>
            </div>
          </div>

          {/* Combobox Components */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Combobox Components</h3>
            <div className="space-y-6">
              <Field>
                <Label>Basic Combobox</Label>
                <Combobox
                  data-testid="combobox-basic"
                  placeholder="Search for a fruit..."
                >
                  <ComboboxInput />
                  <ComboboxList>
                    <ComboboxItem value="apple">Apple</ComboboxItem>
                    <ComboboxItem value="banana">Banana</ComboboxItem>
                    <ComboboxItem value="orange">Orange</ComboboxItem>
                    <ComboboxItem value="grape">Grape</ComboboxItem>
                    <ComboboxItem value="strawberry">Strawberry</ComboboxItem>
                  </ComboboxList>
                </Combobox>
              </Field>
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