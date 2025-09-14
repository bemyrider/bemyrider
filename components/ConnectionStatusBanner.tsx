'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useConnectionStatus } from '@/lib/hooks/use-connection-status';
import {
  Wifi,
  WifiOff,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  X,
} from 'lucide-react';

interface ConnectionStatusBannerProps {
  className?: string;
  showWhenOnline?: boolean;
  autoHide?: boolean;
  hideDelay?: number;
}

export default function ConnectionStatusBanner({
  className = '',
  showWhenOnline = false,
  autoHide = true,
  hideDelay = 3000,
}: ConnectionStatusBannerProps) {
  const {
    isOnline,
    isConnected,
    isHealthy,
    needsRetry,
    maxRetriesReached,
    forceCheck,
    resetRetryCount,
    lastChecked,
  } = useConnectionStatus({
    checkInterval: 30000, // 30 secondi
    maxRetries: 3,
    onStatusChange: status => {
      console.log('Connection status changed:', status);
    },
  });

  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Mostra il banner quando necessario
  useEffect(() => {
    if (isDismissed) return;

    if (isHealthy && showWhenOnline) {
      setIsVisible(true);
      if (autoHide) {
        const timer = setTimeout(() => setIsVisible(false), hideDelay);
        return () => clearTimeout(timer);
      }
    } else if (!isHealthy) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isHealthy, showWhenOnline, autoHide, hideDelay, isDismissed]);

  // Reset dismissed state quando la connessione cambia
  useEffect(() => {
    if (!isHealthy) {
      setIsDismissed(false);
    }
  }, [isHealthy]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  const handleRetry = () => {
    resetRetryCount();
    forceCheck();
  };

  if (!isVisible) return null;

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        type: 'destructive' as const,
        icon: WifiOff,
        title: 'Connessione Internet Assente',
        description: 'Verifica la tua connessione internet e riprova.',
        action: null,
      };
    }

    if (isConnected) {
      return {
        type: 'default' as const,
        icon: CheckCircle,
        title: 'Connessione Ripristinata',
        description: 'La connessione è stata ripristinata con successo.',
        action: showWhenOnline ? (
          <Button
            variant='ghost'
            size='sm'
            onClick={handleDismiss}
            className='h-auto p-1'
          >
            <X className='h-4 w-4' />
          </Button>
        ) : null,
      };
    }

    if (maxRetriesReached) {
      return {
        type: 'destructive' as const,
        icon: AlertTriangle,
        title: 'Problemi di Connessione',
        description:
          'Impossible connettersi al server. Verifica la tua connessione e riprova.',
        action: (
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleRetry}
              className='h-auto py-1 px-2'
            >
              <RefreshCw className='h-3 w-3 mr-1' />
              Riprova
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleDismiss}
              className='h-auto p-1'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        ),
      };
    }

    if (needsRetry) {
      return {
        type: 'destructive' as const,
        icon: Wifi,
        title: 'Connessione Instabile',
        description: 'Tentativo di riconnessione in corso...',
        action: (
          <Button
            variant='outline'
            size='sm'
            onClick={handleRetry}
            className='h-auto py-1 px-2'
          >
            <RefreshCw className='h-3 w-3 mr-1' />
            Riprova Ora
          </Button>
        ),
      };
    }

    return null;
  };

  const statusInfo = getStatusInfo();
  if (!statusInfo) return null;

  const Icon = statusInfo.icon;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      <Alert
        variant={statusInfo.type}
        className='rounded-none border-x-0 border-t-0'
      >
        <div className='flex items-center justify-between w-full'>
          <div className='flex items-center gap-3'>
            <Icon className='h-4 w-4 flex-shrink-0' />
            <div className='flex-1'>
              <AlertDescription className='font-medium'>
                {statusInfo.title}
              </AlertDescription>
              <AlertDescription className='text-sm opacity-90'>
                {statusInfo.description}
              </AlertDescription>
              {lastChecked && (
                <AlertDescription className='text-xs opacity-70'>
                  Ultimo controllo: {lastChecked.toLocaleTimeString('it-IT')}
                </AlertDescription>
              )}
            </div>
          </div>
          {statusInfo.action && (
            <div className='flex-shrink-0'>{statusInfo.action}</div>
          )}
        </div>
      </Alert>
    </div>
  );
}
