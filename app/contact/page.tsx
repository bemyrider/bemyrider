'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simula invio form (in futuro si può integrare con un servizio email)
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsSubmitted(true);
      toast({
        title: 'Messaggio inviato!',
        description: 'Ti risponderemo entro 24 ore.',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore. Riprova più tardi.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className='min-h-screen bg-gray-50 py-12'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <CheckCircle className='mx-auto h-16 w-16 text-green-500 mb-4' />
            <h1 className='text-3xl font-bold text-gray-900 mb-4'>
              Messaggio inviato con successo!
            </h1>
            <p className='text-lg text-gray-600 mb-8'>
              Grazie per averci contattato. Ti risponderemo entro 24 ore.
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              className='bg-[#333366] hover:bg-[#2a2a5a]'
            >
              Invia un altro messaggio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>Contattaci</h1>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            Hai domande? Siamo qui per aiutarti. Contattaci per supporto,
            partnership o qualsiasi altra richiesta.
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Informazioni di contatto */}
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-2xl text-[#333366]'>
                  Informazioni di Contatto
                </CardTitle>
                <CardDescription>
                  Siamo disponibili per aiutarti con qualsiasi domanda
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-start space-x-3'>
                  <Mail className='h-5 w-5 text-[#333366] mt-1' />
                  <div>
                    <p className='font-medium text-gray-900'>Email</p>
                    <p className='text-gray-600'>bemyrider@gmail.com</p>
                  </div>
                </div>

                <div className='flex items-start space-x-3'>
                  <Phone className='h-5 w-5 text-[#333366] mt-1' />
                  <div>
                    <p className='font-medium text-gray-900'>Telefono</p>
                    <p className='text-gray-600'>+39 123 456 7890</p>
                  </div>
                </div>

                <div className='flex items-start space-x-3'>
                  <MapPin className='h-5 w-5 text-[#333366] mt-1' />
                  <div>
                    <p className='font-medium text-gray-900'>Sede</p>
                    <p className='text-gray-600'>Milano, Italia</p>
                  </div>
                </div>

                <div className='flex items-start space-x-3'>
                  <Clock className='h-5 w-5 text-[#333366] mt-1' />
                  <div>
                    <p className='font-medium text-gray-900'>Orari</p>
                    <p className='text-gray-600'>Lun-Ven: 9:00-18:00</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card per partnership */}
            <Card className='border-[#ff9900]'>
              <CardHeader>
                <CardTitle className='text-xl text-[#ff9900]'>
                  Partnership
                </CardTitle>
                <CardDescription>
                  Interessato a collaborare con noi?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600 mb-4'>
                  Sei un'azienda che vuole integrare i nostri servizi di rider?
                  Contattaci per discutere partnership e opportunità di
                  business.
                </p>
                <Button
                  variant='outline'
                  className='border-[#ff9900] text-[#ff9900] hover:bg-[#ff9900] hover:text-white'
                >
                  Scopri le partnership
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Form di contatto */}
          <Card>
            <CardHeader>
              <CardTitle className='text-2xl text-[#333366]'>
                Invia un messaggio
              </CardTitle>
              <CardDescription>
                Compila il form e ti risponderemo il prima possibile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-6'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label
                      htmlFor='name'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Nome *
                    </label>
                    <Input
                      id='name'
                      name='name'
                      type='text'
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className='w-full'
                      placeholder='Il tuo nome'
                    />
                  </div>
                  <div>
                    <label
                      htmlFor='email'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Email *
                    </label>
                    <Input
                      id='email'
                      name='email'
                      type='email'
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className='w-full'
                      placeholder='la.tua@email.com'
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor='subject'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Oggetto *
                  </label>
                  <Input
                    id='subject'
                    name='subject'
                    type='text'
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className='w-full'
                    placeholder='Oggetto del messaggio'
                  />
                </div>

                <div>
                  <label
                    htmlFor='message'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Messaggio *
                  </label>
                  <Textarea
                    id='message'
                    name='message'
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    className='w-full min-h-[120px]'
                    placeholder='Scrivi il tuo messaggio qui...'
                  />
                </div>

                <Button
                  type='submit'
                  disabled={isSubmitting}
                  className='w-full bg-[#333366] hover:bg-[#2a2a5a] text-white'
                >
                  {isSubmitting ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Invio in corso...
                    </>
                  ) : (
                    <>
                      <Send className='h-4 w-4 mr-2' />
                      Invia messaggio
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className='mt-16'>
          <h2 className='text-3xl font-bold text-center text-gray-900 mb-8'>
            Domande Frequenti
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>
                  Come funziona bemyrider?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600'>
                  bemyrider è una piattaforma che connette rider qualificati con
                  aziende che necessitano di servizi di consegna. I rider
                  possono registrarsi, creare il loro profilo e ricevere
                  richieste di lavoro.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>
                  Come posso diventare un rider?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600'>
                  Registrati gratuitamente, completa il tuo profilo con le tue
                  competenze e inizia a ricevere richieste di lavoro dalle
                  aziende partner.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>
                  Quanto tempo ci vuole per ricevere una risposta?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600'>
                  Cerchiamo di rispondere a tutti i messaggi entro 24 ore
                  durante i giorni lavorativi.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>
                  Offrite supporto tecnico?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600'>
                  Sì, il nostro team di supporto è disponibile per aiutarti con
                  qualsiasi problema tecnico o domanda sull'utilizzo della
                  piattaforma.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
