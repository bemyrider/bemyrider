'use client';

import { useState, useEffect } from 'react';
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
import { Bike, Store } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { validationRules } from '@/lib/hooks/use-form-validation';
import { notifications, notificationMessages } from '@/lib/notifications';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const router = useRouter();

  // Update form validity in real-time
  useEffect(() => {
    const emailValid = emailRules.every(rule => rule.validate(email));
    const passwordValid = passwordRules.every(rule => rule.validate(password));
    const hasValues = email.trim() !== '' && password.trim() !== '';

    setIsFormValid(emailValid && passwordValid && hasValues);
  }, [email, password]);

  // Validation rules
  const emailRules = [validationRules.required(), validationRules.email()];
  const passwordRules = [
    validationRules.required(),
    validationRules.minLength(6),
  ];

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
    setError('');

    try {
      // Check if Supabase is properly configured
      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL ===
        'https://placeholder.supabase.co'
      ) {
        setError(
          "⚠️ Modalità demo: Configura Supabase per testare l'autenticazione"
        );
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        notifications.error(notificationMessages.loginError);
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

          // Redirect basato sul ruolo
          if (profileData.role === 'merchant') {
            console.log('🏪 Redirecting to merchant dashboard');
            router.push('/dashboard/merchant');
          } else if (profileData.role === 'rider') {
            console.log('🚴‍♂️ Redirecting to rider dashboard');
            router.push('/dashboard/rider');
          } else {
            console.log('❓ Unknown role, redirecting to registration');
            router.push('/auth/register');
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

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='flex items-center justify-center space-x-2 mb-4'>
            <Image
              src='/bemyrider_logo.svg'
              alt='bemyrider logo'
              width={32}
              height={32}
              className='h-8 w-auto'
            />
            <span className='text-2xl font-bold text-gray-900 logo-font'>
              bemyrider
            </span>
          </div>
          <CardTitle>Accedi al tuo account</CardTitle>
          <CardDescription>
            Inserisci le tue credenziali per accedere
          </CardDescription>
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
