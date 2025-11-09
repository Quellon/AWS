'use client';

import { useState } from 'react';
import { LogEntry as LogEntryType } from '@/types';
import LogEntry from './LogEntry';

interface LogListProps {
  logs: LogEntryType[];
}

export default function LogList({ logs }: LogListProps) {
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all');

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(log => log.severity === filter);

  const filterButtons = [
    { value: 'all', label: 'All', count: logs.length },
    { value: 'info', label: 'Info', count: logs.filter(l => l.severity === 'info').length },
    { value: 'warning', label: 'Warning', count: logs.filter(l => l.severity === 'warning').length },
    { value: 'error', label: 'Error', count: logs.filter(l => l.severity === 'error').length },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          📋 Recent Logs
          <span className="text-sm text-gray-500 ml-2">({filteredLogs.length} of {logs.length})</span>
        </h2>

        <div className="flex gap-2 flex-wrap">
          {filterButtons.map(btn => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value as any)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === btn.value
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {btn.label} ({btn.count})
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto pr-2">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-lg">No logs found</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <LogEntry key={log.id} log={log} />
          ))
        )}
      </div>
    </div>
  );
}
