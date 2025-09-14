import { useState, useCallback, useMemo } from 'react';
import { useConnectionStatus } from './use-connection-status';

export interface ApiRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

const DEFAULT_OPTIONS: Required<ApiRetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  retryCondition: error => {
    // Riprova per errori di rete, timeout, e errori 5xx
    return (
      error.name === 'TypeError' || // Network error
      error.name === 'AbortError' || // Timeout
      (error.status >= 500 && error.status < 600) || // Server errors
      error.message?.includes('fetch') ||
      error.message?.includes('network') ||
      error.message?.includes('timeout')
    );
  },
  onRetry: () => {},
  onSuccess: () => {},
  onError: () => {},
};

export const useApiWithRetry = (options: ApiRetryOptions = {}) => {
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);
  const { isHealthy, forceCheck } = useConnectionStatus();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);

  const executeWithRetry = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      customOptions?: Partial<ApiRetryOptions>
    ): Promise<T | null> => {
      const finalOptions = { ...opts, ...customOptions };
      let lastError: any = null;

      setLoading(true);
      setError(null);
      setRetryCount(0);

      for (let attempt = 0; attempt <= finalOptions.maxRetries; attempt++) {
        try {
          // Se non c'è connessione, non provare a fare chiamate
          if (!isHealthy && attempt === 0) {
            throw new Error('No internet connection available');
          }

          const result = await apiCall();

          // Successo - reset retry count e chiama callback
          setRetryCount(0);
          finalOptions.onSuccess?.(result);
          return result;
        } catch (err: any) {
          lastError = err;
          setRetryCount(attempt);

          // Se non è un errore che merita retry, esci subito
          if (!finalOptions.retryCondition(err)) {
            setError(err);
            finalOptions.onError?.(err);
            return null;
          }

          // Se abbiamo raggiunto il massimo numero di tentativi
          if (attempt >= finalOptions.maxRetries) {
            setError(err);
            finalOptions.onError?.(err);
            return null;
          }

          // Notifica del retry
          finalOptions.onRetry?.(attempt + 1, err);
          console.warn(
            `API call failed, retrying... (attempt ${attempt + 1}/${finalOptions.maxRetries + 1})`,
            err
          );

          // Aspetta prima del prossimo tentativo
          if (attempt < finalOptions.maxRetries) {
            await new Promise(resolve =>
              setTimeout(
                resolve,
                finalOptions.retryDelay * Math.pow(2, attempt)
              )
            );
          }
        }
      }

      setError(lastError);
      finalOptions.onError?.(lastError);
      return null;
    },
    [opts, isHealthy]
  );

  const execute = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      customOptions?: Partial<ApiRetryOptions>
    ): Promise<T | null> => {
      return executeWithRetry(apiCall, customOptions);
    },
    [executeWithRetry]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setRetryCount(0);
  }, []);

  const retry = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      customOptions?: Partial<ApiRetryOptions>
    ): Promise<T | null> => {
      // Forza un check della connessione prima di riprovare
      forceCheck();

      // Aspetta un po' per dare tempo al check di completarsi
      await new Promise(resolve => setTimeout(resolve, 500));

      return executeWithRetry(apiCall, customOptions);
    },
    [executeWithRetry, forceCheck]
  );

  return {
    execute,
    retry,
    reset,
    loading,
    error,
    retryCount,
    isHealthy,
    canRetry: retryCount < opts.maxRetries,
    maxRetriesReached: retryCount >= opts.maxRetries,
  };
};

// Hook specializzato per chiamate Supabase
export const useSupabaseWithRetry = (options: ApiRetryOptions = {}) => {
  const apiRetry = useApiWithRetry({
    ...options,
    retryCondition: error => {
      // Condizioni specifiche per errori Supabase
      return (
        error?.message?.includes('fetch') ||
        error?.message?.includes('network') ||
        error?.message?.includes('timeout') ||
        error?.code === 'PGRST301' || // JWT expired
        error?.code === 'PGRST302' || // JWT invalid
        error?.status >= 500 ||
        error?.name === 'TypeError' ||
        error?.name === 'AbortError'
      );
    },
  });

  return apiRetry;
};
