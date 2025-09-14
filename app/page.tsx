import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bike, Store, Clock, Shield, Euro, Users } from 'lucide-react';
import { UserNav } from '@/components/UserNav';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      {/* Navigation */}
      <nav className='fixed top-0 left-0 right-0 z-50 border-b bg-white/95 backdrop-blur-sm shadow-sm'>
        <div className='container mx-auto px-4 py-4 flex justify-between items-center'>
          <div className='flex items-center'>
            <Image
              src='/bemyrider_logo_text.svg'
              alt='bemyrider'
              width={140}
              height={40}
              className='h-10 w-auto'
            />
          </div>
          <UserNav />
        </div>
      </nav>

      {/* Hero Section */}
      <section className='container mx-auto px-4 pt-32 pb-20 text-center'>
        <h1 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
          Connetti <span className='text-blue-600'>Rider</span> e{' '}
          <span className='text-green-600'>Esercenti</span>
        </h1>
        <p className='text-xl text-gray-600 mb-8 max-w-3xl mx-auto'>
          bemyrider è la piattaforma che mette in contatto esercenti locali con
          rider autonomi per prenotazioni di consegne a tariffa oraria.
          Semplice, trasparente e conveniente.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link href='/auth/register'>
            <Button size='lg' className='bg-blue-600 hover:bg-blue-700'>
              <Bike className='mr-2 h-5 w-5' />
              Diventa Rider
            </Button>
          </Link>
          <Link href='/auth/register'>
            <Button
              size='lg'
              variant='outline'
              className='border-green-600 text-green-600 hover:bg-green-50'
            >
              <Store className='mr-2 h-5 w-5' />
              Registra la tua Attività
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className='container mx-auto px-4 py-20'>
        <h2 className='text-3xl font-bold text-center text-gray-900 mb-12'>
          Perché scegliere bemyrider?
        </h2>
        <div className='grid md:grid-cols-3 gap-8'>
          <Card className='text-center'>
            <CardHeader>
              <div className='mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4'>
                <Clock className='h-6 w-6 text-blue-600' />
              </div>
              <CardTitle>Prenotazioni Semplici</CardTitle>
              <CardDescription>
                Prenota un rider per le tue consegne in pochi click. Scegli
                data, ora e durata del servizio.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className='text-center'>
            <CardHeader>
              <div className='mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4'>
                <Euro className='h-6 w-6 text-green-600' />
              </div>
              <CardTitle>Tariffe Trasparenti</CardTitle>
              <CardDescription>
                Ogni rider definisce la propria tariffa oraria. Nessuna
                sorpresa, solo prezzi chiari e onesti.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className='text-center'>
            <CardHeader>
              <div className='mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4'>
                <Shield className='h-6 w-6 text-purple-600' />
              </div>
              <CardTitle>Pagamenti Sicuri</CardTitle>
              <CardDescription>
                Pagamenti gestiti da Stripe con massima sicurezza. Il rider
                riceve il pagamento direttamente sul suo account.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className='bg-white py-20'>
        <div className='container mx-auto px-4'>
          <h2 className='text-3xl font-bold text-center text-gray-900 mb-12'>
            Come funziona?
          </h2>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div>
              <h3 className='text-2xl font-semibold text-gray-900 mb-6'>
                Per i Rider
              </h3>
              <div className='space-y-4'>
                <div className='flex items-start space-x-3'>
                  <div className='w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                    1
                  </div>
                  <div>
                    <h4 className='font-semibold'>Crea il tuo profilo</h4>
                    <p className='text-gray-600'>
                      Registrati e definisci la tua tariffa oraria
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                    2
                  </div>
                  <div>
                    <h4 className='font-semibold'>Gestisci la disponibilità</h4>
                    <p className='text-gray-600'>
                      Seleziona i giorni e orari in cui sei disponibile
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                    3
                  </div>
                  <div>
                    <h4 className='font-semibold'>Ricevi prenotazioni</h4>
                    <p className='text-gray-600'>
                      Accetta le richieste e guadagna
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className='text-2xl font-semibold text-gray-900 mb-6'>
                Per gli Esercenti
              </h3>
              <div className='space-y-4'>
                <div className='flex items-start space-x-3'>
                  <div className='w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                    1
                  </div>
                  <div>
                    <h4 className='font-semibold'>Cerca rider disponibili</h4>
                    <p className='text-gray-600'>
                      Sfoglia i profili e le tariffe
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                    2
                  </div>
                  <div>
                    <h4 className='font-semibold'>Prenota il servizio</h4>
                    <p className='text-gray-600'>Scegli data, ora e durata</p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                    3
                  </div>
                  <div>
                    <h4 className='font-semibold'>Paga in sicurezza</h4>
                    <p className='text-gray-600'>
                      Completa il pagamento con carta
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='container mx-auto px-4 py-20 text-center'>
        <h2 className='text-3xl font-bold text-gray-900 mb-6'>
          Pronto a iniziare?
        </h2>
        <p className='text-xl text-gray-600 mb-8'>
          Unisciti a bemyrider e scopri un nuovo modo di gestire le consegne
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link href='/auth/register'>
            <Button size='lg' className='bg-blue-600 hover:bg-blue-700'>
              <Bike className='mr-2 h-5 w-5' />
              Inizia come Rider
            </Button>
          </Link>
          <Link href='/auth/register'>
            <Button
              size='lg'
              variant='outline'
              className='border-green-600 text-green-600 hover:bg-green-50'
            >
              <Store className='mr-2 h-5 w-5' />
              Registra Attività
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-12'>
        <div className='container mx-auto px-4 text-center'>
          <div className='flex items-center justify-center space-x-2 mb-4'>
            <Bike className='h-6 w-6 text-blue-400' />
            <span className='text-xl font-bold'>bemyrider</span>
          </div>
          <p className='text-gray-400 mb-4'>
            Connetti rider e esercenti per consegne efficienti e trasparenti
          </p>
          <div className='flex justify-center space-x-6 text-sm text-gray-400'>
            <a
              href='https://bemyrider.it/app/privacy-policy/'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-white'
            >
              Privacy Policy
            </a>
            <a
              href='https://bemyrider.it/app/termini-e-condizioni-bemyrider/'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-white'
            >
              Termini e Condizioni
            </a>
            <Link href='/contact' className='hover:text-white'>
              Contatti
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
