"use client";

import React, { useState } from 'react';
import { LatencyData } from '../lib/api/cloudflare-service';

interface ExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data?: LatencyData[];
}

export default function ExportPanel({ isOpen, onClose, data = [] }: ExportPanelProps) {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [exportType, setExportType] = useState<'all' | 'filtered' | 'selected'>('all');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (data && data.length > 0) {
      setError(null);
    }
  }, [data]);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    
    try {
      if (!data || data.length === 0) {
        throw new Error('No data available for export');
      }
      const hasValidData = data.every(item => 
        item.exchange && 
        typeof item.latency === 'number' && 
        item.cloud && 
        item.region && 
        item.location && 
        typeof item.location.lat === 'number' && 
        typeof item.location.lng === 'number'
      );

      if (!hasValidData) {
        throw new Error('Data structure is invalid. Some required fields are missing.');
      }

      console.log('Starting export:', { format: exportFormat, type: exportType, dataLength: data.length });
      
      switch (exportFormat) {
        case 'json':
          await exportJSON();
          break;
        case 'csv':
          await exportCSV();
          break;
        case 'pdf':
          await exportPDF();
          break;
        default:
          throw new Error(`Unsupported export format: ${exportFormat}`);
      }
      
      console.log('Export completed successfully');
    } catch (error) {
      console.error('Export failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      alert(`Export failed: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportJSON = async () => {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const exportData = {
      timestamp: new Date().toISOString(),
      data: data,
      metadata: {
        totalExchanges: data.length,
        exportType,
        includeCharts,
        includeStats,
        exportFormat: 'json'
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `latency-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportCSV = async () => {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const headers = ['Exchange', 'Latency (ms)', 'Cloud Provider', 'Region', 'Location', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        `"${item.exchange}"`, 
        item.latency,
        `"${item.cloud}"`,
        `"${item.region}"`,
        `"${item.location.lat},${item.location.lng}"`,
        `"${item.timestamp}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `latency-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      throw new Error('Failed to open print window. Please allow popups for this site.');
    }

    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Latency Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
            .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #3b82f6; }
            .stat-label { color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; }
            .latency-low { color: #22c55e; }
            .latency-medium { color: #eab308; }
            .latency-high { color: #ef4444; }
            @media print {
              body { margin: 0; }
              .header { margin-bottom: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Latency Topology Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${data.length}</div>
              <div class="stat-label">Total Exchanges</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${data.length > 0 ? (data.reduce((sum, item) => sum + item.latency, 0) / data.length).toFixed(1) : 0}ms</div>
              <div class="stat-label">Average Latency</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${data.length > 0 ? Math.min(...data.map(item => item.latency)) : 0}ms</div>
              <div class="stat-label">Minimum Latency</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${data.length > 0 ? Math.max(...data.map(item => item.latency)) : 0}ms</div>
              <div class="stat-label">Maximum Latency</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Exchange</th>
                <th>Latency (ms)</th>
                <th>Cloud Provider</th>
                <th>Region</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(item => `
                <tr>
                  <td>${item.exchange}</td>
                  <td class="latency-${item.latency < 30 ? 'low' : item.latency < 60 ? 'medium' : 'high'}">${item.latency}ms</td>
                  <td>${item.cloud}</td>
                  <td>${item.region}</td>
                  <td>${item.location.lat.toFixed(4)}, ${item.location.lng.toFixed(4)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
    
    setTimeout(() => {
      reportWindow.print();
      reportWindow.close();
    }, 1000);
  };

  const getLatencyStats = () => {
    if (data.length === 0) return null;
    
    const latencies = data.map(item => item.latency);
    return {
      min: Math.min(...latencies),
      max: Math.max(...latencies),
      avg: latencies.reduce((sum, val) => sum + val, 0) / latencies.length,
      count: data.length
    };
  };

  const stats = getLatencyStats();
  const isExportDisabled = isExporting || !data || data.length === 0;
  const exportButtonText = isExporting 
    ? 'Exporting...' 
    : !data || data.length === 0 
    ? 'No Data Available' 
    : 'Export Data';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Export Latency Data
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800 dark:text-red-200 font-medium">
                  {error}
                </span>
              </div>
            </div>
          )}

          {(!data || data.length === 0) && !error && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                  No data available for export. Please wait for data to load or refresh the page.
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'json', label: 'JSON', desc: 'Structured data with metadata' },
                { value: 'csv', label: 'CSV', desc: 'Spreadsheet compatible' },
                { value: 'pdf', label: 'PDF', desc: 'Printable report' }
              ].map(format => (
                <button
                  key={format.value}
                  onClick={() => setExportFormat(format.value as 'json' | 'csv' | 'pdf')}
                  disabled={isExportDisabled}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    exportFormat === format.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  } ${isExportDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">{format.label}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{format.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Data Selection
            </label>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'All Data', desc: 'Export all available latency data' },
                { value: 'filtered', label: 'Filtered Data', desc: 'Export only currently filtered data' },
                { value: 'selected', label: 'Selected Exchange', desc: 'Export data for selected exchange only' }
              ].map(type => (
                <label key={type.value} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    value={type.value}
                    checked={exportType === type.value}
                    onChange={(e) => setExportType(e.target.value as 'all' | 'filtered' | 'selected')}
                    disabled={isExportDisabled}
                    className="text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{type.label}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{type.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Export Options
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeStats}
                  onChange={(e) => setIncludeStats(e.target.checked)}
                  disabled={isExportDisabled}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-gray-900 dark:text-white">Include statistics and summaries</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  disabled={isExportDisabled}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-gray-900 dark:text-white">Include charts and visualizations</span>
              </label>
            </div>
          </div>

          {stats && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Data Preview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Total Exchanges</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{stats.count}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Average Latency</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{stats.avg.toFixed(1)}ms</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Min Latency</div>
                  <div className="font-semibold text-green-600 dark:text-green-400">{stats.min}ms</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Max Latency</div>
                  <div className="font-semibold text-red-600 dark:text-red-400">{stats.max}ms</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExportDisabled}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <span>{exportButtonText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 