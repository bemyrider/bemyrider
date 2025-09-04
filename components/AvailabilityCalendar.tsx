'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Calendar, Clock, Plus, X, Save, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TimeSlot {
  start_time: string;
  end_time: string;
}

interface DayAvailability {
  day: 'Lun' | 'Mar' | 'Mer' | 'Gio' | 'Ven' | 'Sab' | 'Dom';
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

const DAYS = [
  { key: 'Lun' as const, label: 'Lunedì', short: 'Lun' },
  { key: 'Mar' as const, label: 'Martedì', short: 'Mar' },
  { key: 'Mer' as const, label: 'Mercoledì', short: 'Mer' },
  { key: 'Gio' as const, label: 'Giovedì', short: 'Gio' },
  { key: 'Ven' as const, label: 'Venerdì', short: 'Ven' },
  { key: 'Sab' as const, label: 'Sabato', short: 'Sab' },
  { key: 'Dom' as const, label: 'Domenica', short: 'Dom' },
];

interface AvailabilityCalendarProps {
  riderId: string;
  onClose: () => void;
}

export default function AvailabilityCalendar({
  riderId,
  onClose,
}: AvailabilityCalendarProps) {
  const [availability, setAvailability] = useState<DayAvailability[]>(
    DAYS.map(day => ({
      day: day.key,
      isAvailable: false,
      timeSlots: [],
    }))
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchAvailability();
  }, [riderId]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('disponibilita_riders')
        .select('*')
        .eq('rider_id', riderId);

      if (error) {
        console.error('Error fetching availability:', error);
        return;
      }

      // Transform database data to component state
      const availabilityMap = new Map();
      data?.forEach(item => {
        availabilityMap.set(item.day_of_week, {
          start_time: item.start_time,
          end_time: item.end_time,
        });
      });

      setAvailability(prev =>
        prev.map(day => {
          const dbSlot = availabilityMap.get(day.day);
          return {
            ...day,
            isAvailable: !!dbSlot,
            timeSlots: dbSlot ? [dbSlot] : [],
          };
        })
      );
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dayKey: string) => {
    setAvailability(prev =>
      prev.map(day =>
        day.day === dayKey
          ? {
              ...day,
              isAvailable: !day.isAvailable,
              timeSlots: !day.isAvailable
                ? [{ start_time: '09:00', end_time: '17:00' }]
                : [],
            }
          : day
      )
    );
  };

  const addTimeSlot = (dayKey: string) => {
    setAvailability(prev =>
      prev.map(day =>
        day.day === dayKey
          ? {
              ...day,
              timeSlots: [
                ...day.timeSlots,
                { start_time: '09:00', end_time: '17:00' },
              ],
            }
          : day
      )
    );
  };

  const removeTimeSlot = (dayKey: string, slotIndex: number) => {
    setAvailability(prev =>
      prev.map(day =>
        day.day === dayKey
          ? {
              ...day,
              timeSlots: day.timeSlots.filter(
                (_, index) => index !== slotIndex
              ),
            }
          : day
      )
    );
  };

  const updateTimeSlot = (
    dayKey: string,
    slotIndex: number,
    field: 'start_time' | 'end_time',
    value: string
  ) => {
    setAvailability(prev =>
      prev.map(day =>
        day.day === dayKey
          ? {
              ...day,
              timeSlots: day.timeSlots.map((slot, index) =>
                index === slotIndex ? { ...slot, [field]: value } : slot
              ),
            }
          : day
      )
    );
  };

  const saveAvailability = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // Delete existing availability
      await supabase
        .from('disponibilita_riders')
        .delete()
        .eq('rider_id', riderId);

      // Insert new availability
      const availabilityData = [];
      for (const day of availability) {
        if (day.isAvailable) {
          for (const slot of day.timeSlots) {
            availabilityData.push({
              rider_id: riderId,
              day_of_week: day.day,
              start_time: slot.start_time,
              end_time: slot.end_time,
            });
          }
        }
      }

      if (availabilityData.length > 0) {
        const { error } = await supabase
          .from('disponibilita_riders')
          .insert(availabilityData);

        if (error) {
          throw error;
        }
      }

      setMessage({
        type: 'success',
        text: 'Disponibilità salvata con successo!',
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Error saving availability:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Errore nel salvataggio',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-6 text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p>Caricamento disponibilità...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <Card className='w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <Calendar className='h-5 w-5 text-purple-600' />
              <CardTitle>Gestisci Disponibilità</CardTitle>
            </div>
            <Button variant='ghost' size='sm' onClick={onClose}>
              <X className='h-4 w-4' />
            </Button>
          </div>
          <CardDescription>
            Imposta i tuoi orari di disponibilità per ogni giorno della
            settimana
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-6'>
          {message && (
            <div
              className={`p-3 rounded-lg flex items-center space-x-2 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {message.type === 'success' && (
                <CheckCircle className='h-4 w-4' />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <div className='space-y-4'>
            {DAYS.map(({ key, label, short }) => {
              const dayData = availability.find(d => d.day === key)!;

              return (
                <Card key={key} className='border-l-4 border-purple-500'>
                  <CardContent className='p-4'>
                    <div className='flex items-center justify-between mb-3'>
                      <div className='flex items-center space-x-3'>
                        <Button
                          variant={dayData.isAvailable ? 'default' : 'outline'}
                          size='sm'
                          onClick={() => toggleDay(key)}
                          className='w-16'
                        >
                          {short}
                        </Button>
                        <span className='font-medium'>{label}</span>
                      </div>

                      {dayData.isAvailable && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => addTimeSlot(key)}
                        >
                          <Plus className='h-4 w-4 mr-1' />
                          Aggiungi Fascia
                        </Button>
                      )}
                    </div>

                    {dayData.isAvailable && (
                      <div className='space-y-2'>
                        {dayData.timeSlots.map((slot, slotIndex) => (
                          <div
                            key={slotIndex}
                            className='flex items-center space-x-2 bg-gray-50 p-2 rounded'
                          >
                            <Clock className='h-4 w-4 text-gray-500' />
                            <div className='flex items-center space-x-2'>
                              <Label
                                htmlFor={`start-${key}-${slotIndex}`}
                                className='text-sm'
                              >
                                Da:
                              </Label>
                              <Input
                                id={`start-${key}-${slotIndex}`}
                                type='time'
                                value={slot.start_time}
                                onChange={e =>
                                  updateTimeSlot(
                                    key,
                                    slotIndex,
                                    'start_time',
                                    e.target.value
                                  )
                                }
                                className='w-32'
                              />
                            </div>
                            <div className='flex items-center space-x-2'>
                              <Label
                                htmlFor={`end-${key}-${slotIndex}`}
                                className='text-sm'
                              >
                                A:
                              </Label>
                              <Input
                                id={`end-${key}-${slotIndex}`}
                                type='time'
                                value={slot.end_time}
                                onChange={e =>
                                  updateTimeSlot(
                                    key,
                                    slotIndex,
                                    'end_time',
                                    e.target.value
                                  )
                                }
                                className='w-32'
                              />
                            </div>

                            {dayData.timeSlots.length > 1 && (
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => removeTimeSlot(key, slotIndex)}
                                className='text-red-500 hover:text-red-700'
                              >
                                <X className='h-4 w-4' />
                              </Button>
                            )}
                          </div>
                        ))}

                        {dayData.timeSlots.length === 0 && (
                          <p className='text-sm text-gray-500 italic'>
                            Nessuna fascia oraria impostata
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className='flex justify-end space-x-3 pt-4 border-t'>
            <Button variant='outline' onClick={onClose} disabled={saving}>
              Annulla
            </Button>
            <Button onClick={saveAvailability} disabled={saving}>
              {saving ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className='h-4 w-4 mr-2' />
                  Salva Disponibilità
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
