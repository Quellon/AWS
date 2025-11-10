'use client';

import { useState, useEffect } from 'react';
import { fetchLogs } from '@/lib/api';
import { LogEntry, LogStats } from '@/types';
import StatsCard from '@/components/StatsCard';
import LogForm from '@/components/LogForm';
import LogList from '@/components/LogList';
import LogChart from '@/components/LogChart';

export default function Dashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats>({
    total: 0,
    errors: 0,
    warnings: 0,
    info: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load logs function
  const loadLogs = async () => {
    try {
      const data = await fetchLogs();
      setLogs(data.logs);

      // Calculate stats
      const newStats = {
        total: data.logs.length,
        errors: data.logs.filter(log => log.severity === 'error').length,
        warnings: data.logs.filter(log => log.severity === 'warning').length,
        info: data.logs.filter(log => log.severity === 'info').length,
      };
      setStats(newStats);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Failed to load logs:', error);
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadLogs();
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadLogs();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-200">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                 AWS Log Service Dashboard
              </h1>
              <p className="text-gray-600">
                Real-time serverless logging system powered by AWS Lambda & DynamoDB
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-sm font-semibold text-gray-700">
                  {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  autoRefresh
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                }`}
              >
                {autoRefresh ? ' Auto-refresh ON' : ' Auto-refresh OFF'}
              </button>
              <button
                onClick={loadLogs}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition transform hover:scale-105 active:scale-95"
              >
                 Refresh Now
              </button>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Total Logs"
            value={stats.total}
            icon=""
            color="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
          />
          <StatsCard
            title="Info"
            value={stats.info}
            icon=""
            color="bg-gradient-to-br from-green-500 to-green-600 text-white"
          />
          <StatsCard
            title="Warnings"
            value={stats.warnings}
            icon=""
            color="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white"
          />
          <StatsCard
            title="Errors"
            value={stats.errors}
            icon=""
            color="bg-gradient-to-br from-red-500 to-red-600 text-white"
          />
        </div>

        {/* Charts */}
        {logs.length > 0 && (
          <div className="mb-6">
            <LogChart logs={logs} />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Log Form */}
          <div className="lg:col-span-1">
            <LogForm onSuccess={loadLogs} />
          </div>

          {/* Log List */}
          <div className="lg:col-span-2">
            <LogList logs={logs} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-600">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="mb-2">
              <strong>Tech Stack:</strong> Next.js 14 • React 18 • TypeScript • Tailwind CSS • Recharts
            </p>
            <p className="mb-2">
              <strong>Backend:</strong> AWS Lambda (Node.js) • DynamoDB • Terraform
            </p>
            <p className="text-sm">
              Built with using serverless architecture | Auto-refreshes every 5 seconds
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
