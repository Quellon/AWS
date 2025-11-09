export interface LogEntry {
  id: string;
  dateTime: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  logPartition: string;
}

export interface LogsResponse {
  count: number;
  logs: LogEntry[];
}

export interface IngestRequest {
  severity: 'info' | 'warning' | 'error';
  message: string;
}

export interface IngestResponse {
  success: boolean;
  id: string;
  dateTime: string;
}

export interface LogStats {
  total: number;
  errors: number;
  warnings: number;
  info: number;
}
