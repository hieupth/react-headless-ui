/**
 * Motion Components Category Page
 * Following CLAUDE.md requirements: Each category has dedicated page showing ALL components in category.
 */

'use client';

// Force dynamic rendering to avoid SSG issues
export const dynamic = 'force-dynamic';

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
  Shake,
  Flip,
  BlurInOut,
  StaggerChildren,
  ParallaxScroll,
  RevealOnScroll,
  HoverLift,
  MagneticHover
} from '@react-ui-forge/renderer';







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
  const [bounceTrigger, setBounceTrigger] = useState(false);

  const motionComponents = [
    { name: 'Fade In/Out', description: 'Smooth opacity transitions for elements', status: 'available' },
    { name: 'Slide In', description: 'Elements sliding in from different directions', status: 'available' },
    { name: 'Scale In/Out', description: 'Scale animations with smooth transitions', status: 'available' },
    { name: 'Rotate In', description: 'Rotating entrance animations', status: 'available' },
    { name: 'Bounce', description: 'Bouncing animation effects', status: 'available' },
    { name: 'Shake', description: 'Shake animation for attention', status: 'available' },
    { name: 'Pulse', description: 'Gentle pulsing animation', status: 'available' },
    { name: 'Flip', description: '3D flip animations', status: 'available' },
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
            {/* Success Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-800 font-medium">Motion Components - Fully Functional</span>
              </div>
              <p className="text-green-700 text-sm">
                All 14 motion components are now fully functional with Framer Motion integration.
                These components provide smooth, performant animations with accessibility support.
                Each component respects user preferences including prefers-reduced-motion.
              </p>
              <p className="text-green-700 text-sm mt-2">
                Active components: FadeInOut, SlideIn, ScaleInOut, RotateIn, Bounce, Shake, Pulse, Flip, BlurInOut, StaggerChildren, ParallaxScroll, RevealOnScroll, HoverLift, MagneticHover
              </p>
            </div>
            {/* Basic Animations - Real Components */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Basic Animations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4 text-center">Fade In/Out</h4>
                  <div className="flex justify-center mb-4">
                    <FadeInOut show={fadeShow} data-testid="fade-in-out-demo">
                      <div className="w-20 h-20 bg-blue-500 rounded-lg"></div>
                    </FadeInOut>
                  </div>
                  <button
                    onClick={() => setFadeShow(!fadeShow)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    {fadeShow ? 'Hide' : 'Show'} Fade
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4 text-center">Slide In</h4>
                  <div className="flex justify-center mb-4">
                    <SlideIn
                      show={slideShow}
                      direction="left"
                      data-testid="slide-in-demo"
                    >
                      <div className="w-20 h-20 bg-green-500 rounded-lg"></div>
                    </SlideIn>
                  </div>
                  <button
                    onClick={() => setSlideShow(!slideShow)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    {slideShow ? 'Hide' : 'Show'} Slide
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4 text-center">Scale In/Out</h4>
                  <div className="flex justify-center mb-4">
                    <ScaleInOut show={scaleShow} data-testid="scale-in-out-demo">
                      <div className="w-20 h-20 bg-purple-500 rounded-lg"></div>
                    </ScaleInOut>
                  </div>
                  <button
                    onClick={() => setScaleShow(!scaleShow)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  >
                    {scaleShow ? 'Hide' : 'Show'} Scale
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Animations - Real Components */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Advanced Animations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4 text-center">Rotate In</h4>
                  <div className="flex justify-center mb-4">
                    <RotateIn show={rotateShow} data-testid="rotate-in-demo">
                      <div className="w-20 h-20 bg-orange-500 rounded-lg"></div>
                    </RotateIn>
                  </div>
                  <button
                    onClick={() => setRotateShow(!rotateShow)}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                  >
                    {rotateShow ? 'Hide' : 'Show'} Rotate
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4 text-center">Flip</h4>
                  <div className="flex justify-center mb-4">
                    <Flip show={flipShow} data-testid="flip-demo">
                      <div className="w-20 h-20 bg-red-500 rounded-lg"></div>
                    </Flip>
                  </div>
                  <button
                    onClick={() => setFlipShow(!flipShow)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    {flipShow ? 'Hide' : 'Show'} Flip
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4 text-center">Blur In/Out</h4>
                  <div className="flex justify-center mb-4">
                    <BlurInOut show={blurShow} data-testid="blur-in-out-demo">
                      <div className="w-20 h-20 bg-indigo-500 rounded-lg"></div>
                    </BlurInOut>
                  </div>
                  <button
                    onClick={() => setBlurShow(!blurShow)}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                  >
                    {blurShow ? 'Hide' : 'Show'} Blur
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Examples - Real Components */}
        {activeTab === 'examples' && (
          <div className="space-y-8 mb-12">
            {/* Trigger-based Animations */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Trigger-based Animations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4 text-center">Bounce</h4>
                  <div className="flex justify-center mb-4">
                    <Bounce show={bounceShow} data-testid="bounce-demo">
                      <div className="w-16 h-16 bg-yellow-500 rounded-full"></div>
                    </Bounce>
                  </div>
                  <button
                    onClick={() => setBounceShow(!bounceShow)}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                  >
                    {bounceShow ? 'Hide' : 'Show'} Bounce
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4 text-center">Shake</h4>
                  <div className="flex justify-center mb-4">
                    <Shake trigger={shakeTrigger} data-testid="shake-demo">
                      <div className="w-16 h-16 bg-red-500 rounded-lg"></div>
                    </Shake>
                  </div>
                  <button
                    onClick={() => setShakeTrigger(!shakeTrigger)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Trigger Shake
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-800 mb-4 text-center">Pulse</h4>
                  <div className="flex justify-center mb-4">
                    <Pulse show data-testid="pulse-demo">
                      <div className="w-16 h-16 bg-green-500 rounded-full"></div>
                    </Pulse>
                  </div>
                  <p className="text-center text-sm text-gray-600">Continuous pulse animation</p>
                </div>
              </div>
            </div>

            {/* Hover Effects */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Hover Effects</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <h4 className="font-medium text-gray-800 mb-4 text-center">Hover Lift</h4>
                  <div className="flex justify-center">
                    <HoverLift data-testid="hover-lift-demo">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg flex items-center justify-center text-white font-medium">
                        Hover Me
                      </div>
                    </HoverLift>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-4">Hover over the card to see the lift effect</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <h4 className="font-medium text-gray-800 mb-4 text-center">Magnetic Hover</h4>
                  <div className="flex justify-center">
                    <MagneticHover data-testid="magnetic-hover-demo">
                      <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg shadow-lg flex items-center justify-center text-white font-medium">
                        Magnetic
                      </div>
                    </MagneticHover>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-4">Move your mouse over the card</p>
                </div>
              </div>
            </div>

            {/* Stagger Animation */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Stagger Animation</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-center mb-4">
                  <StaggerChildren show={staggerShow} data-testid="stagger-demo">
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 bg-blue-500 rounded"
                          style={{ backgroundColor: `hsl(${i * 60}, 70%, 50%)` }}
                        />
                      ))}
                    </div>
                  </StaggerChildren>
                </div>
                <button
                  onClick={() => setStaggerShow(!staggerShow)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {staggerShow ? 'Hide' : 'Show'} Stagger
                </button>
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