'use client';

// 🔧 AUTH CLEANUP UTILITY (Solo per sviluppatori)
// Per pulire tutti i dati di autenticazione in console:
// localStorage.clear(); sessionStorage.clear();
// document.cookie.split(';').forEach(c => {
//   const [n] = c.split('=');
//   if (n.trim().includes('supabase') || n.trim().includes('sb-')) {
//     document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
//   }
// });
// window.location.href = '/auth/login';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bike, Store } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'rider' | 'merchant' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!role) {
      setError('Please select your role (Rider or Merchant)');
      setLoading(false);
      return;
    }

    try {
      // 🔒 SECURITY: Enhanced signup with email verification
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
          // Force email confirmation for security
          emailRedirectTo: `${window.location.origin}/auth/login?confirmed=true`,
        },
      });

      if (signUpError) {
        // 🔒 SECURITY: Handle specific error cases with better UX
        if (
          signUpError.message.includes('already registered') ||
          signUpError.message.includes('User already registered')
        ) {
          setError(
            'Un account con questa email esiste già. Effettua il login invece.'
          );
          // Suggest redirect to login
          setTimeout(() => {
            toast({
              title: 'Account esistente',
              description:
                'Vuoi accedere con questa email? Vai alla pagina di login.',
            });
          }, 2000);
        } else if (signUpError.message.includes('email_not_confirmed')) {
          setError(
            'Controlla la tua email e conferma la registrazione prima di accedere.'
          );
        } else if (
          signUpError.message.includes('Password should be at least')
        ) {
          setError('La password deve contenere almeno 6 caratteri.');
        } else if (signUpError.message.includes('Invalid email')) {
          setError('Inserisci un indirizzo email valido.');
        } else if (signUpError.message.includes('rate_limit')) {
          setError('Troppi tentativi. Riprova tra qualche minuto.');
        } else {
          setError(signUpError.message || 'Errore durante la registrazione.');
        }
        return;
      }

      // If user exists but needs email confirmation
      if (data.user && !data.session) {
        toast({
          title: '✅ Registrazione completata!',
          description:
            "Controlla la tua email per confermare l'account, poi effettua il login.",
        });
        // Redirect to login with success message
        setTimeout(() => {
          router.push('/auth/login?message=registration_success');
        }, 2000);
        return;
      }

      // If registration successful and user is confirmed
      if (data.user && data.session) {
        console.log(
          '✅ User registered successfully, profile created by trigger'
        );

        toast({
          title: 'Registration successful!',
          description: 'Welcome to bemyrider!',
        });

        // Redirect based on role
        if (role === 'merchant') {
          router.push('/dashboard/merchant');
        } else {
          router.push('/dashboard/rider');
        }
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <main>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <div className='flex items-center justify-center space-x-2 mb-4'>
              <Image
                src='/bemyrider_logo_text.svg'
                alt='bemyrider'
                width={140}
                height={40}
                className='h-10 w-auto'
              />
            </div>
            <CardTitle className='text-2xl font-bold text-center'>
              Create your bemyrider Account
            </CardTitle>
            <CardDescription className='text-center'>
              Choose your role and start your journey.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className='space-y-4'>
              <div>
                <label
                  htmlFor='fullName'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Full Name
                </label>
                <input
                  id='fullName'
                  type='text'
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='John Doe'
                />
              </div>

              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Email
                </label>
                <input
                  id='email'
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='you@example.com'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-3'>
                  Scegli il tuo ruolo
                </label>
                <div className='grid grid-cols-2 gap-3'>
                  <div
                    className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all ${
                      role === 'rider'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setRole('rider')}
                  >
                    <Bike className='w-8 h-8 mx-auto mb-2' />
                    <div className='font-medium'>Rider</div>
                    <div className='text-xs text-gray-600'>
                      Effettuo consegne
                    </div>
                  </div>

                  <div
                    className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all ${
                      role === 'merchant'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setRole('merchant')}
                  >
                    <Store className='w-8 h-8 mx-auto mb-2' />
                    <div className='font-medium'>Esercente</div>
                    <div className='text-xs text-gray-600'>
                      Richiedo consegne
                    </div>
                  </div>
                </div>
                {!role && error && error.includes('role') && (
                  <p className='text-sm text-red-500 mt-2'>
                    ⚠️ Select a role to continue
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Password
                </label>
                <input
                  id='password'
                  type='password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='••••••••'
                />
              </div>

              <div>
                <label
                  htmlFor='confirmPassword'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Confirm Password
                </label>
                <input
                  id='confirmPassword'
                  type='password'
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='••••••••'
                />
              </div>

              {error && <p className='text-sm text-red-500'>{error}</p>}

              <Button type='submit' className='w-full' disabled={loading}>
                {loading ? 'Registering...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  );
}
