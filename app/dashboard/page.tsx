'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Verifica se l'utente è autenticato
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.log('🚫 No authenticated user, redirecting to login');
          router.push('/auth/login');
          return;
        }

        console.log(
          '👤 Authenticated user found:',
          user.id,
          'Email:',
          user.email
        );

        // Recupera il profilo per determinare il ruolo
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // Profilo non trovato, reindirizza alla registrazione
            console.log('📝 No profile found, redirecting to registration');
            router.push('/auth/register');
            return;
          }

          console.error('❌ Error fetching profile:', profileError);
          router.push('/auth/login');
          return;
        }

        console.log('📋 Profile found, role:', profileData.role);

        // Reindirizza alla dashboard appropriata in base al ruolo
        if (profileData.role === 'merchant') {
          console.log('➡️ Redirecting to merchant dashboard');
          router.push('/dashboard/merchant');
        } else if (profileData.role === 'rider') {
          console.log('➡️ Redirecting to rider dashboard');
          router.push('/dashboard/rider');
        } else {
          console.log('❓ Unknown role, redirecting to registration');
          router.push('/auth/register');
        }
      } catch (error) {
        console.error('💥 Unexpected error during redirect:', error);
        router.push('/auth/login');
      }
    };

    handleRedirect();
  }, [router]);

  // Loading UI mentre determina il redirect
  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
        <p className='mt-4 text-gray-600'>Reindirizzamento...</p>
      </div>
    </div>
  );
}
