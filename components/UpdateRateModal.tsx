'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Euro, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UpdateRateModalProps {
  riderId: string;
  currentRate: number | null;
  onClose: () => void;
}

export default function UpdateRateModal({
  riderId,
  currentRate,
  onClose,
}: UpdateRateModalProps) {
  const [hourlyRate, setHourlyRate] = useState<string>(
    currentRate ? currentRate.toString() : ''
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Prevent any browser validation
      const form = e.target as HTMLFormElement;
      if (!form.checkValidity()) {
        e.stopPropagation();
      }

      const rate = parseFloat(hourlyRate.replace(',', '.'));

      // Validate rate
      if (isNaN(rate) || rate <= 0) {
        throw new Error('⚠️ Inserisci una tariffa valida maggiore di €0,01');
      }

      if (rate > 12.5) {
        throw new Error(
          '⚠️ La tariffa non può superare €12,50/ora per rispettare i limiti fiscali (soglia €25,82)'
        );
      }

      console.log('🔄 Updating rider rate...', { riderId, rate });

      // Update rider hourly rate in riders_details table
      const { error } = await supabase
        .from('riders_details')
        .update({
          hourly_rate: rate,
          updated_at: new Date().toISOString(),
        })
        .eq('profile_id', riderId);

      if (error) {
        console.error('❌ Error updating rate:', error);
        throw error;
      }

      console.log('✅ Rate updated successfully');
      setMessage({
        type: 'success',
        text: `✅ Tariffa aggiornata con successo a €${rate.toFixed(2)}/ora`,
      });

      // Close modal after success
      setTimeout(() => {
        onClose();
        window.location.reload(); // Refresh to show updated rate
      }, 1500);
    } catch (error: any) {
      console.error('❌ Error:', error);
      setMessage({
        type: 'error',
        text: error.message || "Errore durante l'aggiornamento",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <Card className='w-full max-w-md bg-white'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <Euro className='h-5 w-5' />
              Aggiorna Tariffa
            </CardTitle>
            <Button
              variant='ghost'
              size='sm'
              onClick={onClose}
              disabled={loading}
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
          <CardDescription>
            Imposta la tua tariffa oraria per i servizi di delivery
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4' noValidate>
            <div className='space-y-2'>
              <Label htmlFor='hourlyRate'>Tariffa Oraria (€/ora)</Label>
              <div className='relative'>
                <Euro className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                <Input
                  id='hourlyRate'
                  type='text'
                  inputMode='decimal'
                  pattern='[0-9]+([.,][0-9]+)?'
                  value={hourlyRate}
                  onChange={e => {
                    let value = e.target.value;

                    // Allow only numbers and decimal separator
                    value = value.replace(/[^0-9.,]/g, '').replace(',', '.');

                    setHourlyRate(value);

                    // Clear previous validation message
                    if (message?.type === 'error') {
                      setMessage(null);
                    }

                    // Real-time validation with Italian message
                    if (value && !isNaN(parseFloat(value))) {
                      const numValue = parseFloat(value);
                      if (numValue > 12.5) {
                        setMessage({
                          type: 'error',
                          text: '⚠️ La tariffa non può superare €12,50/ora per rispettare i limiti fiscali',
                        });
                      } else if (numValue <= 0) {
                        setMessage({
                          type: 'error',
                          text: '⚠️ Inserisci una tariffa valida maggiore di €0,01',
                        });
                      }
                    }
                  }}
                  onKeyDown={e => {
                    // Allow: backspace, delete, tab, escape, enter, decimal point
                    if (
                      [46, 8, 9, 27, 13, 190, 188].indexOf(e.keyCode) !== -1 ||
                      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                      (e.keyCode === 65 && e.ctrlKey === true) ||
                      (e.keyCode === 67 && e.ctrlKey === true) ||
                      (e.keyCode === 86 && e.ctrlKey === true) ||
                      (e.keyCode === 88 && e.ctrlKey === true)
                    ) {
                      return;
                    }
                    // Ensure that it's a number and stop the keypress
                    if (
                      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
                      (e.keyCode < 96 || e.keyCode > 105)
                    ) {
                      e.preventDefault();
                    }
                  }}
                  placeholder='Es. 12.00'
                  className='pl-10'
                  disabled={loading}
                />
              </div>
              <p className='text-xs text-gray-500'>
                Max €12,50/ora per rimanere sotto la soglia fiscale di €25,82 (2
                ore max)
              </p>
            </div>

            {/* Current Rate Display */}
            {currentRate && (
              <div className='bg-blue-50 p-3 rounded-lg'>
                <p className='text-sm text-blue-700'>
                  <strong>Tariffa attuale:</strong> €{currentRate}/ora
                </p>
              </div>
            )}

            {/* Message Display */}
            {message && (
              <div
                className={`p-3 rounded-lg flex items-center gap-2 ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className='h-4 w-4' />
                ) : (
                  <AlertCircle className='h-4 w-4' />
                )}
                <span className='text-sm'>{message.text}</span>
              </div>
            )}

            <div className='flex gap-2 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                disabled={loading}
                className='flex-1'
              >
                Annulla
              </Button>
              <Button
                type='submit'
                disabled={loading || !hourlyRate}
                className='flex-1'
              >
                {loading ? (
                  <>Aggiornamento...</>
                ) : (
                  <>
                    <Save className='mr-2 h-4 w-4' />
                    Salva
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Fiscal Information */}
          <div className='mt-6 bg-green-50 p-3 rounded-lg'>
            <h4 className='text-sm font-medium text-green-700 mb-2'>
              📋 Informazioni Fiscali
            </h4>
            <ul className='text-xs text-green-600 space-y-1'>
              <li>
                • <strong>Tariffa max:</strong> €12,50/ora
              </li>
              <li>
                • <strong>Durata max:</strong> 2 ore per prenotazione
              </li>
              <li>
                • <strong>Totale max:</strong> €25,00 (&lt; €25,82)
              </li>
              <li>
                • <strong>Vantaggio:</strong> Nessuna ritenuta d&apos;acconto
              </li>
            </ul>
            <p className='text-xs text-green-600 mt-2 italic'>
              Fonte:{' '}
              <a
                href='https://www.agenziaentrate.gov.it/portale/schede/pagamenti/versamento-modello-f24-ritenute-su-reddito-di-lavoro-autonomo-f24_rit_red_lav_aut/redditi-soggetti-a-ritenuta-f24_rit_red_lav_aut'
                target='_blank'
                rel='noopener noreferrer'
                className='underline hover:text-green-800'
              >
                Agenzia delle Entrate - Ritenute Lavoro Autonomo
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
