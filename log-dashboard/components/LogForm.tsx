'use client';

import { useState } from 'react';
import { submitLog } from '@/lib/api';
import { IngestRequest } from '@/types';

interface LogFormProps {
  onSuccess: () => void;
}

export default function LogForm({ onSuccess }: LogFormProps) {
  const [formData, setFormData] = useState<IngestRequest>({
    severity: 'info',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await submitLog(formData);
      setSuccess(`Log submitted successfully! ID: ${response.id}`);
      setFormData({ severity: 'info', message: '' });
      setTimeout(() => setSuccess(''), 5000);
      onSuccess(); // Trigger refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit log');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-purple-500 pb-2">
        📝 Submit Log
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Severity
          </label>
          <select
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition text-gray-900 bg-white"
            required
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition resize-none text-gray-900 bg-white"
            rows={4}
            placeholder="Enter your log message..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105 active:scale-95"
        >
          {loading ? 'Submitting...' : 'Submit Log'}
        </button>
      </form>

      {success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
