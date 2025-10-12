/**
 * Simple test page to verify build works.
 * Only tests basic imports without complex components.
 */

'use client';

// Mock button for build testing
interface ButtonProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button = ({ children, className = '', ...props }: ButtonProps) => (
  <button className={`px-4 py-2 bg-blue-600 text-white rounded ${className}`} {...props}>
    {children}
  </button>
);

export default function TestBuildPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Build Test Page</h1>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Button Test</h2>
          <div className="flex gap-4">
            <Button>Click me</Button>
            <Button variant="secondary">Secondary</Button>
          </div>
        </section>

        <section className="mt-8 p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-semibold text-green-800">Build Status</h3>
          <p className="text-green-700">
            If you can see this page, the build is working correctly!
          </p>
        </section>
      </div>
    </div>
  );
}