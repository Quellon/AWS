import { LogsResponse, IngestRequest, IngestResponse } from '@/types';

const INGEST_URL = process.env.NEXT_PUBLIC_INGEST_URL || '';
const READ_URL = process.env.NEXT_PUBLIC_READ_URL || '';

// Log the URLs for debugging (only in development)
if (typeof window !== 'undefined') {
  console.log('API Configuration:', {
    INGEST_URL: INGEST_URL || 'NOT SET',
    READ_URL: READ_URL || 'NOT SET',
  });
}

export async function fetchLogs(): Promise<LogsResponse> {
  if (!READ_URL) {
    throw new Error('READ_URL is not configured. Please set NEXT_PUBLIC_READ_URL in .env.local');
  }

  console.log('Fetching logs from:', READ_URL);

  try {
    const response = await fetch(READ_URL, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fetch logs error:', errorText);
      throw new Error(`Failed to fetch logs: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Fetch logs error:', error);
    throw error;
  }
}

export async function submitLog(data: IngestRequest): Promise<IngestResponse> {
  if (!INGEST_URL) {
    throw new Error('INGEST_URL is not configured. Please set NEXT_PUBLIC_INGEST_URL in .env.local');
  }

  console.log('Submitting log to:', INGEST_URL, data);

  try {
    const response = await fetch(INGEST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Submit log error:', errorText);
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: errorText };
      }
      throw new Error(error.error || `Failed to submit log: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Submit log error:', error);
    throw error;
  }
}
