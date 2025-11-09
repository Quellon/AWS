import { LogEntry as LogEntryType } from '@/types';
import { formatTimeAgo, getSeverityColor, getSeverityBadgeColor } from '@/lib/utils';

interface LogEntryProps {
  log: LogEntryType;
}

export default function LogEntry({ log }: LogEntryProps) {
  const borderColor = getSeverityColor(log.severity);
  const badgeColor = getSeverityBadgeColor(log.severity);

  return (
    <div className={`p-4 border-l-4 ${borderColor} bg-gray-50 rounded-lg hover:shadow-md transition transform hover:translate-x-1 mb-3`}>
      <div className="flex items-start justify-between mb-2">
        <span className={`${badgeColor} px-3 py-1 rounded-full text-xs font-semibold uppercase`}>
          {log.severity}
        </span>
        <span className="text-xs text-gray-500">{formatTimeAgo(log.dateTime)}</span>
      </div>
      <p className="text-gray-800 mb-2 break-words">{log.message}</p>
      <div className="text-xs text-gray-400 font-mono">ID: {log.id}</div>
    </div>
  );
}
