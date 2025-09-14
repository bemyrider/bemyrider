'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ValidatedInput } from '@/components/ui/validated-input';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bike, Store, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { validationRules } from '@/lib/hooks/use-form-validation';
import { notifications, notificationMessages } from '@/lib/notifications';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const router = useRouter();

  // Validation rules
  const emailRules = useMemo(
    () => [validationRules.required(), validationRules.email()],
    []
  );
  const passwordRules = useMemo(
    () => [validationRules.required(), validationRules.minLength(6)],
    []
  );

  // Get redirect URL and confirmation status from query parameters
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    // Get parameters from URL search params
    const searchParams = new URLSearchParams(window.location.search);
    const redirectParam = searchParams.get('redirectTo');
    const confirmedParam = searchParams.get('confirmed');
    const messageParam = searchParams.get('message');

    if (redirectParam) {
      setRedirectTo(decodeURIComponent(redirectParam));
    }

    if (confirmedParam === 'true') {
      setEmailConfirmed(true);
      // Show success notification
      setTimeout(() => {
        notifications.success(
          'Email confermata con successo! Ora puoi accedere.',
          {
            title: '✅ Email Verificata',
            duration: 5000,
          }
        );
      }, 100);
      // Clean up URL
      window.history.replaceState({}, '', '/auth/login');
    }

    if (messageParam === 'registration_success') {
      setRegistrationSuccess(true);
      // Show success notification
      setTimeout(() => {
        notifications.success(
          "Registrazione completata! Controlla la tua email per confermare l'account.",
          {
            title: '🎉 Benvenuto su bemyrider!',
            duration: 7000,
          }
        );
      }, 100);
      // Clean up URL
      window.history.replaceState({}, '', '/auth/login');
    }
  }, []);

  // Update form validity in real-time
  useEffect(() => {
    const emailValid = emailRules.every(rule => rule.validate(email));
    const passwordValid = passwordRules.every(rule => rule.validate(password));
    const hasValues = email.trim() !== '' && password.trim() !== '';

    setIsFormValid(emailValid && passwordValid && hasValues);
  }, [email, password, emailRules, passwordRules]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    const emailErrors = emailRules
      .filter(rule => !rule.validate(email))
      .map(rule => rule.message);
    const passwordErrors = passwordRules
      .filter(rule => !rule.validate(password))
      .map(rule => rule.message);

    const newFormErrors = {
      email: emailErrors,
      password: passwordErrors,
    };

    setFormErrors(newFormErrors);

    if (emailErrors.length > 0 || passwordErrors.length > 0) {
      return;
    }

    setLoading(true);

    try {
      // Check if Supabase is properly configured
      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL ===
        'https://placeholder.supabase.co'
      ) {
        notifications.warning(
          "⚠️ Modalità demo: Configura Supabase per testare l'autenticazione"
        );
        setLoading(false);
        return;
      }

      // 🔒 SECURITY: Use getUser() for server-side authentication verification
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // ... existing error handling
      }

      // 🔒 SECURITY: Verify authentication server-side
      const {
        data: { user: verifiedUser },
        error: verifyError,
      } = await supabase.auth.getUser();

      if (verifyError || !verifiedUser) {
        console.error(
          '❌ Server-side authentication verification failed:',
          verifyError
        );
        notifications.error('Errore di autenticazione. Riprova.', {
          title: 'Verifica fallita',
        });
        setLoading(false);
        return;
      }

      if (verifiedUser.id !== data.user?.id) {
        console.error('❌ User ID mismatch between login and verification');
        notifications.error('Errore di sicurezza. Riprova.', {
          title: 'Verifica sicurezza fallita',
        });
        setLoading(false);
        return;
      }

      if (error) {
        console.error('❌ Login error:', error);

        // Handle specific error cases
        if (
          error.message.includes('email_not_confirmed') ||
          error.message.includes('Email not confirmed')
        ) {
          notifications.error(
            'Controlla la tua email e conferma il tuo account prima di accedere.',
            {
              title: 'Email non confermata',
            }
          );
          setShowResendButton(true);
        } else if (
          error.message.includes('invalid_credentials') ||
          error.message.includes('Invalid login credentials')
        ) {
          notifications.error('Email o password non corrette. Riprova.', {
            title: 'Credenziali non valide',
          });
        } else if (error.message.includes('too_many_requests')) {
          notifications.error(
            'Hai fatto troppi tentativi. Riprova più tardi.',
            {
              title: 'Troppi tentativi',
            }
          );
        } else {
          notifications.error(
            error.message || "Si è verificato un errore durante l'accesso.",
            {
              title: 'Errore di accesso',
            }
          );
        }

        setLoading(false);
        return;
      }

      if (data.user) {
        // Ottieni il profilo utente per determinare il ruolo
        console.log('🔍 User logged in, fetching profile to determine role...');

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('❌ Error fetching profile:', profileError);
          notifications.error(notificationMessages.serverError);
          setLoading(false);
          return;
        }

        if (profileData) {
          console.log('👤 User profile found:', profileData.role);

          // Mostra notifica di successo
          notifications.success(notificationMessages.loginSuccess);

          // Redirect basato sul ruolo o al redirectTo se specificato
          if (redirectTo) {
            console.log('🔄 Redirecting to original destination:', redirectTo);
            // Usa window.location.href per forzare un reload completo e sincronizzare lo stato
            window.location.href = redirectTo;
          } else if (profileData.role === 'merchant') {
            console.log('🏪 Redirecting to merchant dashboard');
            window.location.href = '/dashboard/merchant';
          } else if (profileData.role === 'rider') {
            console.log('🚴‍♂️ Redirecting to rider dashboard');
            window.location.href = '/dashboard/rider';
          } else {
            console.log('❓ Unknown role, redirecting to registration');
            window.location.href = '/auth/register';
          }
        } else {
          console.log('❌ No profile found, redirecting to registration');
          router.push('/auth/register');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      notifications.error(notificationMessages.networkError);
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      notifications.error(
        'Inserisci il tuo indirizzo email per rispedire la conferma.',
        {
          title: 'Email richiesta',
        }
      );
      return;
    }

    setResendLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        notifications.error(
          "Impossibile rispedire l'email di conferma. Riprova più tardi.",
          {
            title: 'Errore',
          }
        );
      } else {
        notifications.success(
          'Controlla la tua casella di posta per il link di conferma.',
          {
            title: 'Email inviata!',
          }
        );
        setShowResendButton(false);
      }
    } catch (error) {
      console.error('Error resending confirmation:', error);
      notifications.error(
        "Si è verificato un errore durante l'invio dell'email.",
        {
          title: 'Errore',
        }
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='flex items-center justify-center space-x-2 mb-4'>
            <Image
              src='/bemyrider_logo_text.svg'
              alt='bemyrider'
              width={140}
              height={40}
              className='h-10 w-auto'
            />
          </div>
          <CardTitle>Accedi al tuo account</CardTitle>
          <CardDescription>
            Inserisci le tue credenziali per accedere
          </CardDescription>

          {/* Messaggi informativi - fuori da CardDescription per evitare hydration error */}
          {redirectTo && (
            <div className='mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700'>
              🚪 Effettua l'accesso per continuare alla pagina richiesta
            </div>
          )}
          {emailConfirmed && (
            <div className='mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700'>
              ✅ Il tuo account è stato verificato! Inserisci le tue credenziali
              per accedere.
            </div>
          )}
          {registrationSuccess && (
            <div className='mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700'>
              📧 Registrazione completata! Controlla la tua email per il link di
              conferma, poi torna qui per accedere.
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className='space-y-4'>
            <ValidatedInput
              id='email'
              label='Email'
              type='email'
              value={email}
              onChange={setEmail}
              validationRules={emailRules}
              placeholder='la-tua-email@example.com'
              required
              helpText='Inserisci il tuo indirizzo email'
            />

            <ValidatedInput
              id='password'
              label='Password'
              type='password'
              value={password}
              onChange={setPassword}
              validationRules={passwordRules}
              placeholder='••••••••'
              required
              password
              helpText='Almeno 6 caratteri'
            />

            <Button
              type='submit'
              className='w-full bg-blue-600 hover:bg-blue-700'
              disabled={loading || !isFormValid}
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </Button>

            {showResendButton && (
              <Button
                type='button'
                variant='outline'
                className='w-full mt-3'
                onClick={handleResendConfirmation}
                disabled={resendLoading}
              >
                <Mail className='w-4 h-4 mr-2' />
                {resendLoading
                  ? 'Invio email...'
                  : 'Rispedisci email di conferma'}
              </Button>
            )}
          </form>

          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-600'>
              Non hai un account?{' '}
              <Link
                href='/auth/register'
                className='text-blue-600 hover:text-blue-700 font-medium'
              >
                Registrati
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
