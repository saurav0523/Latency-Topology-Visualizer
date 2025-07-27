/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectLatencyData, selectLoading, selectError, selectLastUpdated } from '../../store/slices/latencySlice';

export default function DebugPage() {
  const [clientState, setClientState] = useState({
    isClient: false,
    timestamp: new Date().toISOString()
  });

  const latencyData = useAppSelector(selectLatencyData);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const lastUpdated = useAppSelector(selectLastUpdated);

  useEffect(() => {
    setClientState({
      isClient: true,
      timestamp: new Date().toISOString()
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Debug Information
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Client State</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Is Client:</span>
                <span className={clientState.isClient ? 'text-green-600' : 'text-red-600'}>
                  {clientState.isClient ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Timestamp:</span>
                <span className="text-sm text-gray-600">{clientState.timestamp}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Redux State</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Loading:</span>
                <span className={loading ? 'text-yellow-600' : 'text-green-600'}>
                  {loading ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Data Count:</span>
                <span className="text-blue-600">{latencyData?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Last Updated:</span>
                <span className="text-sm text-gray-600">{lastUpdated || 'Never'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Error:</span>
                <span className={error ? 'text-red-600' : 'text-green-600'}>
                  {error || 'None'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Data Preview</h2>
            {latencyData && latencyData.length > 0 ? (
              <div className="space-y-2">
                {latencyData.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{item.exchange}</span>
                    <span className="text-sm text-gray-600">{item.latency}ms</span>
                    <span className="text-sm text-gray-600">{item.cloud}</span>
                    <span className="text-sm text-gray-600">{item.region}</span>
                  </div>
                ))}
                {latencyData.length > 5 && (
                  <p className="text-sm text-gray-500">... and {latencyData.length - 5} more items</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Environment Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="font-medium">Node Environment:</span>
                <p className="text-sm text-gray-600">{process.env.NODE_ENV}</p>
              </div>
              <div>
                <span className="font-medium">Development Mode:</span>
                <p className="text-sm text-gray-600">{process.env.NODE_ENV === 'development' ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <span className="font-medium">User Agent:</span>
                <p className="text-sm text-gray-600">{typeof window !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'SSR'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex space-x-4">
          <a 
            href="/"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Back to Main App
          </a>
          <a 
            href="/test-tailwind"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Test Tailwind CSS
          </a>
          <a 
            href="/test-api"
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
          >
            Test API
          </a>
        </div>
      </div>
    </div>
  );
} 