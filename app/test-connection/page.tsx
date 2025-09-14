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
import { Alert, AlertDescription } from '@/components/ui/alert';
import ConnectionStatusBanner from '@/components/ConnectionStatusBanner';
import ConnectionTestPanel from '@/components/ConnectionTestPanel';
import { useConnectionStatus } from '@/lib/hooks/use-connection-status';
import { ArrowLeft, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ConnectionTestPage() {
  const router = useRouter();
  const [showBanner, setShowBanner] = useState(true);

  const connectionStatus = useConnectionStatus({
    checkInterval: 5000, // 5 secondi per test più frequenti
    onStatusChange: status => {
      console.log('Connection status changed:', status);
    },
  });

  const getStatusIcon = () => {
    if (!connectionStatus.isOnline) {
      return <WifiOff className='h-6 w-6 text-red-500' />;
    }
    if (connectionStatus.isConnected) {
      return <Wifi className='h-6 w-6 text-green-500' />;
    }
    return <AlertTriangle className='h-6 w-6 text-yellow-500' />;
  };

  const getStatusText = () => {
    if (!connectionStatus.isOnline) {
      return 'Offline';
    }
    if (connectionStatus.isConnected) {
      return 'Connected';
    }
    return 'Unstable';
  };

  const getStatusColor = () => {
    if (!connectionStatus.isOnline) {
      return 'destructive';
    }
    if (connectionStatus.isConnected) {
      return 'default';
    }
    return 'secondary';
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Connection Status Banner */}
      {showBanner && <ConnectionStatusBanner />}

      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        {/* Header */}
        <div className='mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <Button variant='ghost' onClick={() => router.back()}>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Torna Indietro
            </Button>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowBanner(!showBanner)}
              >
                {showBanner ? 'Nascondi' : 'Mostra'} Banner
              </Button>
            </div>
          </div>

          <h1 className='text-3xl font-bold text-gray-900'>Test Connessione</h1>
          <p className='text-gray-600'>
            Verifica lo stato della connessione e testa i servizi
            dell'applicazione
          </p>
        </div>

        {/* Current Status Overview */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              {getStatusIcon()}
              Stato Attuale
            </CardTitle>
            <CardDescription>
              Panoramica dello stato della connessione
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='text-center'>
                <p className='text-sm font-medium text-gray-600'>Status</p>
                <Badge variant={getStatusColor() as any} className='mt-1'>
                  {getStatusText()}
                </Badge>
              </div>
              <div className='text-center'>
                <p className='text-sm font-medium text-gray-600'>Online</p>
                <p className='text-lg font-semibold'>
                  {connectionStatus.isOnline ? 'Sì' : 'No'}
                </p>
              </div>
              <div className='text-center'>
                <p className='text-sm font-medium text-gray-600'>Connected</p>
                <p className='text-lg font-semibold'>
                  {connectionStatus.isConnected ? 'Sì' : 'No'}
                </p>
              </div>
            </div>

            <div className='mt-4 pt-4 border-t'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                <div>
                  <p className='font-medium'>Ultimo Controllo:</p>
                  <p className='text-gray-600'>
                    {connectionStatus.lastChecked?.toLocaleString('it-IT') ||
                      'Mai'}
                  </p>
                </div>
                <div>
                  <p className='font-medium'>Tentativi di Retry:</p>
                  <p className='text-gray-600'>{connectionStatus.retryCount}</p>
                </div>
                <div>
                  <p className='font-medium'>Connessione Stabile:</p>
                  <p className='text-gray-600'>
                    {connectionStatus.isHealthy ? 'Sì' : 'No'}
                  </p>
                </div>
                <div>
                  <p className='font-medium'>Necessita Retry:</p>
                  <p className='text-gray-600'>
                    {connectionStatus.needsRetry ? 'Sì' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Panel */}
        <ConnectionTestPanel />

        {/* Instructions */}
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>Istruzioni per il Test</CardTitle>
            <CardDescription>
              Come utilizzare questa pagina per testare la connessione
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <h4 className='font-medium mb-2'>1. Test di Base</h4>
              <p className='text-sm text-gray-600'>
                Il sistema monitora automaticamente lo stato della connessione
                ogni 5 secondi. Puoi vedere lo stato attuale nella sezione
                "Stato Attuale" sopra.
              </p>
            </div>

            <div>
              <h4 className='font-medium mb-2'>2. Test Avanzati</h4>
              <p className='text-sm text-gray-600'>
                Usa il pannello "Test Results" per eseguire test specifici:
              </p>
              <ul className='text-sm text-gray-600 mt-2 ml-4 list-disc'>
                <li>
                  <strong>Health Endpoint:</strong> Testa la risposta del server
                </li>
                <li>
                  <strong>Supabase Connection:</strong> Verifica la connessione
                  al database
                </li>
                <li>
                  <strong>Network Latency:</strong> Misura la latenza di rete
                </li>
              </ul>
            </div>

            <div>
              <h4 className='font-medium mb-2'>3. Simulazione Problemi</h4>
              <p className='text-sm text-gray-600'>
                Per testare il comportamento con problemi di connessione:
              </p>
              <ul className='text-sm text-gray-600 mt-2 ml-4 list-disc'>
                <li>Disconnetti la connessione internet</li>
                <li>Attiva la modalità offline nel browser</li>
                <li>Blocca temporaneamente le richieste di rete</li>
              </ul>
            </div>

            <Alert>
              <AlertTriangle className='h-4 w-4' />
              <AlertDescription>
                <strong>Nota:</strong> Questa pagina è solo per scopi di test e
                sviluppo. Non utilizzare in produzione.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
