'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Settings,
  Euro,
  FileText,
  Clock,
  AlertTriangle,
  Shield,
  Bell,
  HelpCircle,
  User,
  Lock,
} from 'lucide-react';

interface RiderProfile {
  id: string;
  riders_details: {
    stripe_onboarding_complete: boolean | null;
  } | null;
}

interface ModuloImpostazioniProps {
  profile: RiderProfile;
  onUpdateRate: () => void;
  onFiscalData: () => void;
  onDeleteAccount: () => void;
  onboardingState: number;
  requiredState: number;
}

export default function ModuloImpostazioni({
  profile,
  onUpdateRate,
  onFiscalData,
  onDeleteAccount,
  onboardingState,
  requiredState,
}: ModuloImpostazioniProps) {
  const isActive = onboardingState >= requiredState;

  if (!isActive) {
    return (
      <Card className='relative overflow-hidden opacity-60 pointer-events-none'>
        <CardContent className='relative px-6 pt-6 pb-6'>
          <div className='absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300'>
            <div className='text-center p-6 max-w-xs'>
              <Settings className='h-12 w-12 text-gray-400 mx-auto mb-3' />
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
              <Settings className='h-5 w-5' /> Impostazioni
            </CardTitle>
            <CardDescription>
              Gestisci impostazioni account e preferenze
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
          <Settings className='h-5 w-5' /> Impostazioni
        </CardTitle>
        <CardDescription>
          Gestisci impostazioni account, preferenze e dati fiscali
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Azioni Rapide */}
        <div className='space-y-3'>
          <h3 className='text-lg font-semibold flex items-center gap-2'>
            <Settings className='h-4 w-4' /> Azioni Rapide
          </h3>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <Button
              variant='outline'
              className='h-auto p-4 justify-start'
              onClick={onUpdateRate}
              disabled={!profile.riders_details?.stripe_onboarding_complete}
            >
              <div className='flex items-center gap-3'>
                <Euro className='h-5 w-5 text-blue-600' />
                <div className='text-left'>
                  <div className='font-medium'>Aggiorna Tariffa</div>
                  <div className='text-xs text-gray-500'>
                    Modifica prezzo orario
                  </div>
                </div>
              </div>
            </Button>

            <Button
              variant='outline'
              className='h-auto p-4 justify-start'
              onClick={onFiscalData}
              disabled={!profile.riders_details?.stripe_onboarding_complete}
            >
              <div className='flex items-center gap-3'>
                <FileText className='h-5 w-5 text-green-600' />
                <div className='text-left'>
                  <div className='font-medium'>Dati Fiscali</div>
                  <div className='text-xs text-gray-500'>
                    Gestisci informazioni fiscali
                  </div>
                </div>
              </div>
            </Button>

            <Button
              variant='outline'
              className='h-auto p-4 justify-start'
              disabled={!profile.riders_details?.stripe_onboarding_complete}
            >
              <div className='flex items-center gap-3'>
                <Clock className='h-5 w-5 text-purple-600' />
                <div className='text-left'>
                  <div className='font-medium'>Cronologia</div>
                  <div className='text-xs text-gray-500'>
                    Visualizza storico attività
                  </div>
                </div>
              </div>
            </Button>

            <Button
              variant='outline'
              className='h-auto p-4 justify-start'
              disabled={!profile.riders_details?.stripe_onboarding_complete}
            >
              <div className='flex items-center gap-3'>
                <Bell className='h-5 w-5 text-orange-600' />
                <div className='text-left'>
                  <div className='font-medium'>Notifiche</div>
                  <div className='text-xs text-gray-500'>
                    Impostazioni notifiche
                  </div>
                </div>
              </div>
            </Button>
          </div>

          {!profile.riders_details?.stripe_onboarding_complete && (
            <div className='bg-orange-50 border border-orange-200 rounded-lg p-3'>
              <p className='text-sm text-orange-700 text-center'>
                Completa l&apos;onboarding Stripe per abilitare queste funzioni
              </p>
            </div>
          )}
        </div>

        {/* Sezione Sicurezza */}
        <div className='border-t pt-6'>
          <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <Shield className='h-4 w-4' /> Sicurezza e Privacy
          </h3>

          <div className='space-y-3'>
            <Button
              variant='outline'
              className='w-full justify-start h-auto p-4'
            >
              <div className='flex items-center gap-3'>
                <User className='h-5 w-5 text-indigo-600' />
                <div className='text-left'>
                  <div className='font-medium'>Profilo e Sicurezza</div>
                  <div className='text-xs text-gray-500'>
                    Gestisci password e sicurezza account
                  </div>
                </div>
              </div>
            </Button>

            <Button
              variant='outline'
              className='w-full justify-start h-auto p-4'
            >
              <div className='flex items-center gap-3'>
                <Shield className='h-5 w-5 text-indigo-600' />
                <div className='text-left'>
                  <div className='font-medium'>Privacy e Dati</div>
                  <div className='text-xs text-gray-500'>
                    Controlla le tue impostazioni privacy
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </div>

        {/* Sezione Supporto */}
        <div className='border-t pt-6'>
          <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <HelpCircle className='h-4 w-4' /> Supporto
          </h3>

          <div className='space-y-3'>
            <Button
              variant='outline'
              className='w-full justify-start h-auto p-4'
            >
              <div className='flex items-center gap-3'>
                <HelpCircle className='h-5 w-5 text-teal-600' />
                <div className='text-left'>
                  <div className='font-medium'>Centro Assistenza</div>
                  <div className='text-xs text-gray-500'>
                    Guide, FAQ e supporto
                  </div>
                </div>
              </div>
            </Button>

            <Button
              variant='outline'
              className='w-full justify-start h-auto p-4'
            >
              <div className='flex items-center gap-3'>
                <Bell className='h-5 w-5 text-teal-600' />
                <div className='text-left'>
                  <div className='font-medium'>Contatta Supporto</div>
                  <div className='text-xs text-gray-500'>
                    Hai bisogno di aiuto?
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </div>

        {/* Zona Pericolo */}
        <div className='border-t pt-6'>
          <h3 className='text-lg font-semibold mb-4 flex items-center gap-2 text-red-600'>
            <AlertTriangle className='h-4 w-4' /> Zona Pericolo
          </h3>

          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-start gap-3'>
              <AlertTriangle className='h-6 w-6 text-red-600 mt-0.5' />
              <div className='flex-1'>
                <h4 className='font-medium text-red-800 mb-2'>
                  Eliminazione Account
                </h4>
                <p className='text-sm text-red-700 mb-3'>
                  Questa azione è irreversibile. Tutti i tuoi dati, inclusi
                  profilo, portfolio e cronologia dei lavori verranno eliminati
                  definitivamente.
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={onDeleteAccount}
                  className='border-red-300 text-red-700 hover:bg-red-100'
                >
                  <Lock className='w-4 h-4 mr-2' />
                  Elimina Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
