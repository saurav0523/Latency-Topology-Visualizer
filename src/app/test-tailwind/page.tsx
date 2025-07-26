"use client";

import { Link } from "lucide-react";

export default function TestTailwindPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Tailwind CSS Test Page
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Test Card 1 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Styling</h2>
            <p className="text-gray-600 mb-4">
              This card tests basic Tailwind CSS classes including colors, spacing, and typography.
            </p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
              Test Button
            </button>
          </div>

          {/* Test Card 2 */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 text-white">
            <h2 className="text-xl font-semibold mb-4">Gradients & Colors</h2>
            <p className="mb-4 opacity-90">
              This card tests gradient backgrounds and text colors.
            </p>
            <div className="flex space-x-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Tag 1</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Tag 2</span>
            </div>
          </div>

          {/* Test Card 3 */}
          <div className="bg-gray-900 text-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Dark Theme</h2>
            <p className="text-gray-300 mb-4">
              This card tests dark theme styling and contrast.
            </p>
            <div className="space-y-2">
              <div className="h-2 bg-gray-700 rounded-full">
                <div className="h-2 bg-green-500 rounded-full w-3/4"></div>
              </div>
              <div className="h-2 bg-gray-700 rounded-full">
                <div className="h-2 bg-yellow-500 rounded-full w-1/2"></div>
              </div>
            </div>
          </div>

          {/* Test Card 4 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Animations</h2>
            <p className="text-gray-600 mb-4">
              This card tests Tailwind animations and transitions.
            </p>
            <div className="flex space-x-4">
              <div className="animate-pulse bg-blue-500 w-8 h-8 rounded-full"></div>
              <div className="animate-bounce bg-green-500 w-8 h-8 rounded-full"></div>
              <div className="animate-spin bg-purple-500 w-8 h-8 rounded-full"></div>
            </div>
          </div>

          {/* Test Card 5 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsive Design</h2>
            <p className="text-gray-600 mb-4">
              This card tests responsive design classes.
            </p>
            <div className="text-sm">
              <p className="text-red-500 md:text-green-500 lg:text-blue-500">
                Color changes on different screen sizes
              </p>
            </div>
          </div>

          {/* Test Card 6 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Animations</h2>
            <p className="text-gray-600 mb-4">
              This card tests custom animations defined in our config.
            </p>
            <div className="space-y-2">
              <div className="animate-pulse-fast bg-red-500 h-4 rounded"></div>
              <div className="animate-pulse-slow bg-yellow-500 h-4 rounded"></div>
              <div className="animate-shimmer bg-gradient-to-r from-gray-200 to-gray-300 h-4 rounded"></div>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-green-800 font-medium">Tailwind CSS Working</span>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-blue-800 font-medium">Responsive Design Active</span>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
              <span className="text-purple-800 font-medium">Custom Animations Loaded</span>
            </div>
          </div>
        </div>

        {/* Back to Main App */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Main Application
          </Link>
        </div>
      </div>
    </div>
  );
} 