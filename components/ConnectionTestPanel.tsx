'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useConnectionStatus } from '@/lib/hooks/use-connection-status';
import { useApiWithRetry } from '@/lib/hooks/use-api-with-retry';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

export default function ConnectionTestPanel() {
  const [testResults, setTestResults] = useState<
    Array<{
      test: string;
      status: 'success' | 'error' | 'loading';
      message: string;
      timestamp: Date;
    }>
  >([]);

  const connectionStatus = useConnectionStatus({
    checkInterval: 10000, // 10 secondi per test più frequenti
    onStatusChange: status => {
      console.log('Connection status changed:', status);
    },
  });

  const {
    execute: executeWithRetry,
    loading: apiLoading,
    error: apiError,
    retryCount,
  } = useApiWithRetry({
    maxRetries: 2,
    retryDelay: 500,
    onSuccess: data => {
      console.log('API call succeeded:', data);
    },
    onError: error => {
      console.error('API call failed:', error);
    },
  });

  const addTestResult = (
    test: string,
    status: 'success' | 'error' | 'loading',
    message: string
  ) => {
    setTestResults(prev => [
      { test, status, message, timestamp: new Date() },
      ...prev.slice(0, 9), // Mantieni solo gli ultimi 10 risultati
    ]);
  };

  const testHealthEndpoint = async () => {
    addTestResult('Health Endpoint', 'loading', 'Testing /api/health...');

    const result = await executeWithRetry(async () => {
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    });

    if (result) {
      addTestResult(
        'Health Endpoint',
        'success',
        `Response time: ${result.responseTime}`
      );
    } else {
      addTestResult(
        'Health Endpoint',
        'error',
        'Failed to reach health endpoint'
      );
    }
  };

  const testSupabaseConnection = async () => {
    addTestResult(
      'Supabase Connection',
      'loading',
      'Testing Supabase connection...'
    );

    const result = await executeWithRetry(async () => {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        throw error;
      }

      return data;
    });

    if (result) {
      addTestResult(
        'Supabase Connection',
        'success',
        'Database connection successful'
      );
    } else {
      addTestResult(
        'Supabase Connection',
        'error',
        'Failed to connect to database'
      );
    }
  };

  const testNetworkLatency = async () => {
    addTestResult('Network Latency', 'loading', 'Testing network latency...');

    const startTime = Date.now();
    const result = await executeWithRetry(async () => {
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    });

    if (result) {
      const latency = Date.now() - startTime;
      addTestResult('Network Latency', 'success', `Latency: ${latency}ms`);
    } else {
      addTestResult('Network Latency', 'error', 'Failed to measure latency');
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    await testHealthEndpoint();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testSupabaseConnection();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testNetworkLatency();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'error':
        return <XCircle className='h-4 w-4 text-red-500' />;
      case 'loading':
        return <RefreshCw className='h-4 w-4 text-blue-500 animate-spin' />;
      default:
        return null;
    }
  };

  const getConnectionStatusIcon = () => {
    if (!connectionStatus.isOnline) {
      return <WifiOff className='h-5 w-5 text-red-500' />;
    }
    if (connectionStatus.isConnected) {
      return <Wifi className='h-5 w-5 text-green-500' />;
    }
    return <AlertTriangle className='h-5 w-5 text-yellow-500' />;
  };

  const getConnectionStatusText = () => {
    if (!connectionStatus.isOnline) {
      return 'Offline';
    }
    if (connectionStatus.isConnected) {
      return 'Connected';
    }
    return 'Unstable';
  };

  const getConnectionStatusColor = () => {
    if (!connectionStatus.isOnline) {
      return 'destructive';
    }
    if (connectionStatus.isConnected) {
      return 'default';
    }
    return 'secondary';
  };

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            {getConnectionStatusIcon()}
            Connection Status
          </CardTitle>
          <CardDescription>
            Monitoraggio in tempo reale dello stato della connessione
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-sm font-medium'>Status</p>
              <Badge variant={getConnectionStatusColor() as any}>
                {getConnectionStatusText()}
              </Badge>
            </div>
            <div>
              <p className='text-sm font-medium'>Retry Count</p>
              <p className='text-sm text-gray-600'>{retryCount}/2</p>
            </div>
            <div>
              <p className='text-sm font-medium'>Last Check</p>
              <p className='text-sm text-gray-600'>
                {connectionStatus.lastChecked?.toLocaleTimeString('it-IT') ||
                  'Never'}
              </p>
            </div>
            <div>
              <p className='text-sm font-medium'>API Loading</p>
              <p className='text-sm text-gray-600'>
                {apiLoading ? 'Yes' : 'No'}
              </p>
            </div>
          </div>

          <div className='flex gap-2'>
            <Button
              onClick={connectionStatus.forceCheck}
              variant='outline'
              size='sm'
            >
              <RefreshCw className='h-4 w-4 mr-2' />
              Check Now
            </Button>
            <Button onClick={runAllTests} disabled={apiLoading}>
              <RefreshCw className='h-4 w-4 mr-2' />
              Run All Tests
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>Risultati dei test di connessione</CardDescription>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <p className='text-sm text-gray-500 text-center py-4'>
              Nessun test eseguito. Clicca "Run All Tests" per iniziare.
            </p>
          ) : (
            <div className='space-y-2'>
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between p-2 border rounded'
                >
                  <div className='flex items-center gap-2'>
                    {getStatusIcon(result.status)}
                    <span className='font-medium'>{result.test}</span>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm text-gray-600'>{result.message}</p>
                    <p className='text-xs text-gray-400'>
                      {result.timestamp.toLocaleTimeString('it-IT')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
