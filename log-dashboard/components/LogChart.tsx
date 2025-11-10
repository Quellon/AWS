'use client';

import { LogEntry } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface LogChartProps {
  logs: LogEntry[];
}

const COLORS = {
  info: '#3b82f6',
  warning: '#f59e0b',
  error: '#ef4444',
};

export default function LogChart({ logs }: LogChartProps) {
  // Count by severity
  const severityCounts = {
    info: logs.filter(l => l.severity === 'info').length,
    warning: logs.filter(l => l.severity === 'warning').length,
    error: logs.filter(l => l.severity === 'error').length,
  };

  const pieData = [
    { name: 'Info', value: severityCounts.info, color: COLORS.info },
    { name: 'Warning', value: severityCounts.warning, color: COLORS.warning },
    { name: 'Error', value: severityCounts.error, color: COLORS.error },
  ].filter(d => d.value > 0);

  // Group logs by hour for timeline
  const timelineData = logs.reduce((acc: any, log) => {
    const hour = new Date(log.dateTime).getHours();
    const key = `${hour}:00`;
    if (!acc[key]) {
      acc[key] = { time: key, info: 0, warning: 0, error: 0 };
    }
    acc[key][log.severity]++;
    return acc;
  }, {});

  const barData = Object.values(timelineData).slice(-12); // Last 12 hours

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-purple-500 pb-2">
         Log Analytics
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Distribution by Severity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Timeline (Last 12 Hours)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="info" fill={COLORS.info} name="Info" />
              <Bar dataKey="warning" fill={COLORS.warning} name="Warning" />
              <Bar dataKey="error" fill={COLORS.error} name="Error" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
