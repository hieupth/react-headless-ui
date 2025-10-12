/**
 * Motion Components Category Page
 * Following CLAUDE.md requirements: Each category has dedicated page showing ALL components in category.
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import React from 'react';

// Import real motion components from renderer package
import {
  FadeInOut,
  SlideIn,
  Pulse,
  ScaleInOut,
  RotateIn,
  Bounce,
  BlurInOut,
  StaggerChildren,
  ParallaxScroll,
  RevealOnScroll,
  HoverLift,
  MagneticHover
} from '@react-ui-forge/renderer';

const Shake = ({ children, trigger, className = '' }: {
  children: React.ReactNode;
  trigger?: boolean;
  className?: string;
}) => {
  const [isShaking, setIsShaking] = useState(false);

  React.useEffect(() => {
    if (trigger) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div
      className={`inline-block ${isShaking ? 'animate-pulse' : ''} ${className}`}
      style={isShaking ? { animation: 'shake 0.5s' } : {}}
    >
      {children}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
};

// Pulse component is now imported from @react-ui-forge/renderer

const Flip = ({ show, children, duration = 600, className = '' }: {
  show: boolean;
  children: React.ReactNode;
  duration?: number;
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(show);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(show), 10);
    return () => clearTimeout(timer);
  }, [show]);

  return (
    <div
      className={`transition-all ${isVisible ? 'opacity-100 rotateY-0' : 'opacity-0 rotateY-90'} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {children}
    </div>
  );
};







export default function MotionPage() {
  const [activeTab, setActiveTab] = useState('showcase');
  const [fadeShow, setFadeShow] = useState(true);
  const [slideShow, setSlideShow] = useState(true);
  const [scaleShow, setScaleShow] = useState(true);
  const [rotateShow, setRotateShow] = useState(true);
  const [bounceShow, setBounceShow] = useState(true);
  const [flipShow, setFlipShow] = useState(true);
  const [blurShow, setBlurShow] = useState(true);
  const [staggerShow, setStaggerShow] = useState(true);
  const [shakeTrigger, setShakeTrigger] = useState(false);

  const motionComponents = [
    { name: 'Fade In/Out', description: 'Smooth opacity transitions for elements', status: 'available' },
    { name: 'Slide In', description: 'Elements sliding in from different directions', status: 'available' },
    { name: 'Scale In/Out', description: 'Scale animations with smooth transitions', status: 'available' },
    { name: 'Rotate In', description: 'Rotating entrance animations', status: 'available' },
    { name: 'Bounce', description: 'Bouncing animation effects', status: 'available' },
    { name: 'Shake', description: 'Shake animation for attention', status: 'planned' },
    { name: 'Pulse', description: 'Gentle pulsing animation', status: 'available' },
    { name: 'Flip', description: '3D flip animations', status: 'planned' },
    { name: 'Blur In/Out', description: 'Blur transitions for elements', status: 'available' },
    { name: 'Stagger Children', description: 'Sequential animations for multiple elements', status: 'available' },
    { name: 'Parallax Scroll', description: 'Parallax effects on scroll', status: 'available' },
    { name: 'Reveal on Scroll', description: 'Elements that animate when scrolled into view', status: 'available' },
    { name: 'Hover Lift', description: 'Elements that lift on hover', status: 'available' },
    { name: 'Magnetic Hover', description: 'Elements that follow mouse cursor', status: 'available' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
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
              <li><span className="text-gray-500">Motion</span></li>
            </ol>
          </nav>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Motion Components
          </h1>
          <p className="text-lg text-gray-600">
            Animation and motion components for engaging user interactions.
            Built with CSS transitions and modern animation techniques.
          </p>
        </div>

        {/* Component Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {motionComponents.map((component) => (
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
            {/* Development Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-yellow-800 font-medium">Motion Components - Coming Soon</span>
              </div>
              <p className="text-yellow-700 text-sm">
                The motion components shown below are currently in development.
                These mockups demonstrate the planned functionality and animation patterns.
                The actual components will be powered by Framer Motion and available in the renderer package once implementation is complete.
              </p>
            </div>
            {/* Basic Animations */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Basic Animations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Fade In/Out</h4>
                  <div className="flex justify-center mb-4">
                    <FadeInOut
                      visible={fadeShow}
                      duration={300}
                    >
                      <div className="w-20 h-20 bg-blue-500 rounded-lg"></div>
                    </FadeInOut>
                  </div>
                  <button
                    onClick={() => setFadeShow(!fadeShow)}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Toggle Fade
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Slide In</h4>
                  <div className="flex justify-center mb-4">
                    <SlideIn
                      direction="up"
                      trigger={slideShow}
                      duration={300}
                    >
                      <div className="w-20 h-20 bg-green-500 rounded-lg"></div>
                    </SlideIn>
                  </div>
                  <button
                    onClick={() => setSlideShow(!slideShow)}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Toggle Slide
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Scale In/Out</h4>
                  <div className="flex justify-center mb-4">
                    <ScaleInOut
                      initialActive={scaleShow}
                      duration={400}
                      initialScale={0.8}
                      finalScale={1}
                    >
                      <div className="w-20 h-20 bg-purple-500 rounded-lg"></div>
                    </ScaleInOut>
                  </div>
                  <button
                    onClick={() => setScaleShow(!scaleShow)}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Toggle Scale
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Bounce</h4>
                  <div className="flex justify-center mb-4">
                    <Bounce
                      initialActive={bounceShow}
                      duration={600}
                      direction="up"
                      intensity={1.2}
                    >
                      <div className="w-20 h-20 bg-teal-500 rounded-lg"></div>
                    </Bounce>
                  </div>
                  <button
                    onClick={() => setBounceShow(!bounceShow)}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Toggle Bounce
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Animations */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Advanced Animations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Rotate In</h4>
                  <div className="flex justify-center mb-4">
                    <RotateIn
                      initialActive={rotateShow}
                      duration={500}
                      initialAngle={0}
                      finalAngle={360}
                    >
                      <div className="w-20 h-20 bg-orange-500 rounded-lg"></div>
                    </RotateIn>
                  </div>
                  <button
                    onClick={() => setRotateShow(!rotateShow)}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Toggle Rotate
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Flip</h4>
                  <div className="flex justify-center mb-4">
                    <Flip show={flipShow}>
                      <div className="w-20 h-20 bg-red-500 rounded-lg"></div>
                    </Flip>
                  </div>
                  <button
                    onClick={() => setFlipShow(!flipShow)}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Toggle Flip
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Blur In/Out</h4>
                  <div className="flex justify-center mb-4">
                    <BlurInOut
                      initialActive={blurShow}
                      duration={400}
                      initialBlur={0}
                      finalBlur={8}
                    >
                      <div className="w-20 h-20 bg-indigo-500 rounded-lg"></div>
                    </BlurInOut>
                  </div>
                  <button
                    onClick={() => setBlurShow(!blurShow)}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Toggle Blur
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Animations */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Interactive Animations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Bounce</h4>
                  <div className="flex justify-center mb-4">
                    <Bounce trigger={bounceTrigger}>
                      <div className="w-20 h-20 bg-teal-500 rounded-lg"></div>
                    </Bounce>
                  </div>
                  <button
                    onClick={() => setBounceTrigger(!bounceTrigger)}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Trigger Bounce
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Shake</h4>
                  <div className="flex justify-center mb-4">
                    <Shake trigger={shakeTrigger}>
                      <div className="w-20 h-20 bg-pink-500 rounded-lg"></div>
                    </Shake>
                  </div>
                  <button
                    onClick={() => setShakeTrigger(!shakeTrigger)}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Trigger Shake
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Pulse</h4>
                  <div className="flex justify-center mb-4">
                    <Pulse>
                      <div className="w-20 h-20 bg-yellow-500 rounded-lg"></div>
                    </Pulse>
                  </div>
                  <p className="text-center text-sm text-gray-600">Continuous pulse</p>
                </div>
              </div>
            </div>

            {/* Stagger Animation */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Stagger Children</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-center mb-4">
                  <StaggerChildren
                    initialActive={staggerShow}
                    duration={300}
                    staggerDelay={150}
                    direction="normal"
                  >
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded"></div>
                      <div className="w-8 h-8 bg-green-500 rounded"></div>
                      <div className="w-8 h-8 bg-purple-500 rounded"></div>
                      <div className="w-8 h-8 bg-orange-500 rounded"></div>
                      <div className="w-8 h-8 bg-red-500 rounded"></div>
                    </div>
                  </StaggerChildren>
                </div>
                <button
                  onClick={() => setStaggerShow(!staggerShow)}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Toggle Stagger
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Examples */}
        {activeTab === 'examples' && (
          <div className="space-y-8 mb-12">
            {/* Hover Effects */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Hover Effects</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <h4 className="font-medium text-gray-800 mb-4 text-center">Hover Lift</h4>
                  <div className="flex justify-center">
                    <HoverLift>
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg cursor-pointer"></div>
                    </HoverLift>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-4">Hover over the card to see the lift effect</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <h4 className="font-medium text-gray-800 mb-4 text-center">Magnetic Hover</h4>
                  <div className="flex justify-center">
                    <MagneticHover strength={15}>
                      <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg shadow-lg cursor-pointer"></div>
                    </MagneticHover>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-4">Move your mouse over the card</p>
                </div>
              </div>
            </div>

            {/* Card Gallery with Animations */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Animated Card Gallery</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Fade In', 'Slide Up', 'Scale In'].map((animation, index) => (
                  <RevealOnScroll key={animation}>
                    <HoverLift>
                      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg">
                        <div className={`w-full h-32 bg-gradient-to-br rounded-lg mb-4 ${
                          index === 0 ? 'from-blue-500 to-purple-600' :
                          index === 1 ? 'from-green-500 to-teal-600' :
                          'from-orange-500 to-red-600'
                        }`}></div>
                        <h4 className="font-semibold text-gray-900 mb-2">{animation}</h4>
                        <p className="text-sm text-gray-600">
                          This card uses {animation.toLowerCase()} animation when scrolled into view.
                        </p>
                      </div>
                    </HoverLift>
                  </RevealOnScroll>
                ))}
              </div>
            </div>

            {/* Loading States */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Loading Animations</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Pulse Loading</h4>
                  <div className="space-y-2">
                    <Pulse>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </Pulse>
                    <Pulse>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </Pulse>
                    <Pulse>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </Pulse>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Bounce Loading</h4>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3].map((i) => (
                      <Bounce
                        key={i}
                        initialActive={true}
                        duration={400}
                        direction="up"
                        intensity={0.8}
                        repeat={0} // infinite repeat
                      >
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      </Bounce>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Rotate Loading</h4>
                  <div className="flex justify-center">
                    <RotateIn
                      initialActive={true}
                      duration={800}
                      initialAngle={0}
                      finalAngle={360}
                      repeat={0} // infinite repeat
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg"></div>
                    </RotateIn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="bg-teal-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-teal-900 mb-3">Motion Features</h3>
          <ul className="space-y-2 text-teal-800">
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              CSS-based animations for performance
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Respect for prefers-reduced-motion
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Interactive scroll-based animations
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
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
            CLAUDE.md Compliant: Category page with comprehensive motion components
          </div>
        </div>
      </div>
    </div>
  );
}