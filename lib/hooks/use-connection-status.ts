import { useState, useEffect, useCallback, useMemo } from 'react';

export interface ConnectionStatus {
  isOnline: boolean;
  isConnected: boolean;
  lastChecked: Date | null;
  retryCount: number;
}

export interface ConnectionStatusOptions {
  checkInterval?: number; // in milliseconds
  maxRetries?: number;
  testUrl?: string;
  onStatusChange?: (status: ConnectionStatus) => void;
}

const DEFAULT_OPTIONS: Required<ConnectionStatusOptions> = {
  checkInterval: 30000, // 30 secondi
  maxRetries: 3,
  testUrl: '/api/health', // Endpoint di test
  onStatusChange: () => {},
};

export const useConnectionStatus = (options: ConnectionStatusOptions = {}) => {
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);

  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isConnected: false,
    lastChecked: null,
    retryCount: 0,
  });

  const checkConnection = useCallback(async () => {
    const newStatus: ConnectionStatus = {
      isOnline: navigator.onLine,
      isConnected: false,
      lastChecked: new Date(),
      retryCount: status.retryCount,
    };

    // Se non c'è connessione internet, non provare a fare chiamate
    if (!newStatus.isOnline) {
      setStatus(newStatus);
      opts.onStatusChange?.(newStatus);
      return;
    }

    try {
      // Testa la connessione con una chiamata leggera
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondi timeout

      const response = await fetch(opts.testUrl, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        newStatus.isConnected = true;
        newStatus.retryCount = 0; // Reset retry count on success
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.warn('Connection test failed:', error);
      newStatus.isConnected = false;
      newStatus.retryCount = Math.min(
        newStatus.retryCount + 1,
        opts.maxRetries
      );
    }

    setStatus(newStatus);
    opts.onStatusChange?.(newStatus);
  }, [opts, status.retryCount]);

  // Listener per i cambiamenti di stato online/offline del browser
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Browser online - checking connection...');
      checkConnection();
    };

    const handleOffline = () => {
      console.log('📵 Browser offline');
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        isConnected: false,
        lastChecked: new Date(),
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection]);

  // Check periodico della connessione
  useEffect(() => {
    // Check iniziale
    checkConnection();

    // Setup interval per check periodici
    const interval = setInterval(checkConnection, opts.checkInterval);

    return () => clearInterval(interval);
  }, [checkConnection, opts.checkInterval]);

  // Funzione per forzare un check manuale
  const forceCheck = useCallback(() => {
    console.log('🔄 Manual connection check triggered');
    checkConnection();
  }, [checkConnection]);

  // Funzione per resettare il retry count
  const resetRetryCount = useCallback(() => {
    setStatus(prev => ({ ...prev, retryCount: 0 }));
  }, []);

  return {
    ...status,
    forceCheck,
    resetRetryCount,
    isHealthy: status.isOnline && status.isConnected,
    needsRetry:
      status.isOnline &&
      !status.isConnected &&
      status.retryCount < opts.maxRetries,
    maxRetriesReached: status.retryCount >= opts.maxRetries,
  };
};
