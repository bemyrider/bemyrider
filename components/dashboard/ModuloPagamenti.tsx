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
import {
  CreditCard,
  CircleDollarSign,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Calendar,
  Euro,
  Banknote,
  Receipt,
} from 'lucide-react';

interface RiderProfile {
  id: string;
  riders_details: {
    stripe_account_id: string | null;
    stripe_onboarding_complete: boolean | null;
  } | null;
}

interface ModuloPagamentiProps {
  profile: RiderProfile;
  onStripeOnboarding: () => void;
  onManagePayments: () => void;
  onboardingState: number;
  requiredState: number;
  loading: boolean;
}

export default function ModuloPagamenti({
  profile,
  onStripeOnboarding,
  onManagePayments,
  onboardingState,
  requiredState,
  loading,
}: ModuloPagamentiProps) {
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);

  const isActive = onboardingState >= requiredState;

  const handleCheckOnboardingStatus = async () => {
    setCheckingOnboarding(true);
    try {
      // TODO: Implementare controllo stato onboarding
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  if (!isActive) {
    return (
      <Card className='relative overflow-hidden opacity-60 pointer-events-none'>
        <CardContent className='relative px-6 pt-6 pb-6'>
          <div className='absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300'>
            <div className='text-center p-6 max-w-xs'>
              <CreditCard className='h-12 w-12 text-gray-400 mx-auto mb-3' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Funzione Bloccata
              </h3>
              <p className='text-sm text-gray-600'>
                Completa i passaggi precedenti per sbloccare questa sezione
              </p>
            </div>
          </div>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='h-5 w-5' /> Pagamenti & Guadagni
            </CardTitle>
            <CardDescription>
              Gestisci pagamenti Stripe e monitora i tuoi guadagni
            </CardDescription>
          </CardHeader>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <CreditCard className='h-5 w-5' /> Pagamenti & Guadagni
        </CardTitle>
        <CardDescription>
          Gestisci pagamenti Stripe e monitora i tuoi guadagni
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Sezione Pagamenti Stripe */}
        <div className='border-b pb-6'>
          <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <Banknote className='h-4 w-4' /> Account Pagamenti
          </h3>

          {profile.riders_details?.stripe_onboarding_complete ? (
            <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <CheckCircle className='h-8 w-8 text-green-600' />
                  <div>
                    <h4 className='font-semibold text-green-800'>
                      Account Stripe Attivo
                    </h4>
                    <p className='text-sm text-green-600'>
                      Puoi ricevere pagamenti dai clienti
                    </p>
                  </div>
                </div>
                <Button
                  variant='outline'
                  onClick={onManagePayments}
                  disabled={loading}
                  className='border-green-300 text-green-700 hover:bg-green-100'
                >
                  {loading ? 'Caricamento...' : 'Gestisci Account'}
                </Button>
              </div>
            </div>
          ) : (
            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
              <div className='flex items-start gap-3'>
                <AlertTriangle className='h-8 w-8 text-yellow-600 mt-0.5' />
                <div className='flex-1'>
                  <h4 className='font-semibold text-yellow-800 mb-2'>
                    Configurazione Account Stripe Richiesta
                  </h4>
                  <p className='text-sm text-yellow-700 mb-4'>
                    Completa l&apos;onboarding Stripe per attivare i pagamenti e
                    ricevere compensi per i tuoi servizi. Il processo richiede
                    pochi minuti e verificheremo automaticamente il
                    completamento al tuo ritorno.
                  </p>
                  <div className='flex flex-col sm:flex-row gap-2'>
                    <Button
                      onClick={onStripeOnboarding}
                      disabled={loading}
                      className='bg-green-600 hover:bg-green-700 flex-1'
                    >
                      {loading ? (
                        <div className='flex items-center gap-2'>
                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                          <span className='text-sm'>Verifica Stato...</span>
                        </div>
                      ) : (
                        'Attiva Pagamenti'
                      )}
                    </Button>
                    {profile.riders_details?.stripe_account_id && (
                      <Button
                        variant='outline'
                        onClick={handleCheckOnboardingStatus}
                        disabled={checkingOnboarding}
                        className='border-yellow-300 text-yellow-700 hover:bg-yellow-100'
                      >
                        {checkingOnboarding
                          ? 'Verificando...'
                          : 'Verifica Stato'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sezione Guadagni */}
        <div>
          <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <CircleDollarSign className='h-4 w-4' /> Guadagni e Statistiche
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            {/* Guadagni Totali */}
            <div className='bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-2'>
                <div>
                  <p className='text-sm text-blue-700 font-medium'>
                    Guadagni Totali
                  </p>
                  <p className='text-2xl font-bold text-blue-900'>€0.00</p>
                </div>
                <TrendingUp className='h-8 w-8 text-blue-600' />
              </div>
              <p className='text-xs text-blue-600'>Da quando hai iniziato</p>
            </div>

            {/* Guadagni Questo Mese */}
            <div className='bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-2'>
                <div>
                  <p className='text-sm text-green-700 font-medium'>
                    Questo Mese
                  </p>
                  <p className='text-2xl font-bold text-green-900'>€0.00</p>
                </div>
                <Calendar className='h-8 w-8 text-green-600' />
              </div>
              <p className='text-xs text-green-600'>In crescita del 0%</p>
            </div>
          </div>

          {/* Statistiche Dettagliate */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
            <div className='text-center p-3 bg-gray-50 rounded-lg'>
              <p className='text-lg font-bold text-gray-900'>0</p>
              <p className='text-xs text-gray-600'>Lavori Completati</p>
            </div>
            <div className='text-center p-3 bg-gray-50 rounded-lg'>
              <p className='text-lg font-bold text-gray-900'>0h</p>
              <p className='text-xs text-gray-600'>Ore Lavorate</p>
            </div>
            <div className='text-center p-3 bg-gray-50 rounded-lg'>
              <p className='text-lg font-bold text-gray-900'>€0</p>
              <p className='text-xs text-gray-600'>Media per Lavoro</p>
            </div>
            <div className='text-center p-3 bg-gray-50 rounded-lg'>
              <p className='text-lg font-bold text-gray-900'>0</p>
              <p className='text-xs text-gray-600'>Valutazioni</p>
            </div>
          </div>

          {/* Azioni Guadagni */}
          <div className='flex flex-col sm:flex-row gap-2'>
            <Button variant='outline' className='flex-1'>
              <Receipt className='w-4 h-4 mr-2' />
              Visualizza Storico Pagamenti
            </Button>
            <Button variant='outline' className='flex-1'>
              <TrendingUp className='w-4 h-4 mr-2' />
              Report Dettagliati
            </Button>
          </div>

          {/* Nota per pagamenti non attivi */}
          {!profile.riders_details?.stripe_onboarding_complete && (
            <div className='mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg'>
              <p className='text-sm text-orange-700'>
                💡 <strong>Nota:</strong> I guadagni verranno visualizzati
                automaticamente dopo l&apos;attivazione dell&apos;account Stripe
                e il completamento dei primi lavori.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
