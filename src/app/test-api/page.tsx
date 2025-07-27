/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from 'react';
import { cloudflareApiService } from '../../lib/api/cloudflare-service';
import { freeApisService } from '../../lib/api/free-apis-service';

export default function TestApiPage() {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results: any = {};

    try {
      console.log('Testing token verification...');
      try {
        const tokenResult = await cloudflareApiService.verifyToken();
        results.tokenVerification = { success: true, data: tokenResult };
      } catch (error) {
        results.tokenVerification = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }


      console.log('Testing simulated latency data...');
      try {
        const simulatedData = cloudflareApiService.generateSimulatedLatencyData();
        results.simulatedData = { success: true, count: simulatedData.length, sample: simulatedData[0] };
      } catch (error) {
        results.simulatedData = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }

      console.log('Testing free API latency...');
      try {
        const freeApiResults = await freeApisService.measureFreeApiLatency();
        results.freeApiLatency = { success: true, count: freeApiResults.length, sample: freeApiResults[0] };
      } catch (error) {
        results.freeApiLatency = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }


      console.log('Testing alternative latency data...');
      try {
        const alternativeData = await freeApisService.generateAlternativeLatencyData();
        results.alternativeData = { success: true, count: alternativeData.length, sample: alternativeData[0] };
      } catch (error) {
        results.alternativeData = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }

    } catch (error) {
      console.error('Test suite error:', error);
      results.generalError = error instanceof Error ? error.message : 'Unknown error';
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          API Test Suite
        </h1>

        {loading && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span className="text-blue-800 dark:text-blue-200">Running API tests...</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Token Verification Test
            </h2>
            {testResults.tokenVerification ? (
              <div className={`p-4 rounded-lg ${
                testResults.tokenVerification.success 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    testResults.tokenVerification.success ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`font-medium ${
                    testResults.tokenVerification.success 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {testResults.tokenVerification.success ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                {testResults.tokenVerification.success ? (
                  <pre className="text-sm text-green-700 dark:text-green-300 overflow-x-auto">
                    {JSON.stringify(testResults.tokenVerification.data, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {testResults.tokenVerification.error}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400">Waiting for test results...</div>
            )}
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Simulated Latency Data Test
            </h2>
            {testResults.simulatedData ? (
              <div className={`p-4 rounded-lg ${
                testResults.simulatedData.success 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    testResults.simulatedData.success ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`font-medium ${
                    testResults.simulatedData.success 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {testResults.simulatedData.success ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                {testResults.simulatedData.success ? (
                  <div className="space-y-2">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Generated {testResults.simulatedData.count} data points
                    </p>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-green-700 dark:text-green-300">
                        Sample Data
                      </summary>
                      <pre className="mt-2 text-green-700 dark:text-green-300 overflow-x-auto">
                        {JSON.stringify(testResults.simulatedData.sample, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {testResults.simulatedData.error}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400">Waiting for test results...</div>
            )}
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Free API Latency Test
            </h2>
            {testResults.freeApiLatency ? (
              <div className={`p-4 rounded-lg ${
                testResults.freeApiLatency.success 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    testResults.freeApiLatency.success ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`font-medium ${
                    testResults.freeApiLatency.success 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {testResults.freeApiLatency.success ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                {testResults.freeApiLatency.success ? (
                  <div className="space-y-2">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Measured {testResults.freeApiLatency.count} endpoints
                    </p>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-green-700 dark:text-green-300">
                        Sample Result
                      </summary>
                      <pre className="mt-2 text-green-700 dark:text-green-300 overflow-x-auto">
                        {JSON.stringify(testResults.freeApiLatency.sample, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {testResults.freeApiLatency.error}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400">Waiting for test results...</div>
            )}
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Alternative Latency Data Test
            </h2>
            {testResults.alternativeData ? (
              <div className={`p-4 rounded-lg ${
                testResults.alternativeData.success 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    testResults.alternativeData.success ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`font-medium ${
                    testResults.alternativeData.success 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {testResults.alternativeData.success ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                {testResults.alternativeData.success ? (
                  <div className="space-y-2">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Generated {testResults.alternativeData.count} alternative data points
                    </p>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-green-700 dark:text-green-300">
                        Sample Data
                      </summary>
                      <pre className="mt-2 text-green-700 dark:text-green-300 overflow-x-auto">
                        {JSON.stringify(testResults.alternativeData.sample, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {testResults.alternativeData.error}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400">Waiting for test results...</div>
            )}
          </div>

          {testResults.generalError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                General Error
              </h3>
              <p className="text-red-700 dark:text-red-300">
                {testResults.generalError}
              </p>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={runTests}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Running Tests...' : 'Run Tests Again'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 