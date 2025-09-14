'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DashboardRedirect() {
  const router = useRouter();

  // Add auth state change listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async event => {
      console.log('🔄 Auth state changed in dashboard redirect:', event);

      if (event === 'SIGNED_OUT') {
        console.log(
          '🚪 User signed out or session expired, redirecting to login'
        );
        router.push('/auth/login');
      } else if (event === 'SIGNED_IN') {
        // Verify user authentication for security
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          console.log('✅ User authenticated:', user.id);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Add immediate error handling for auth failures
  useEffect(() => {
    const handleAuthErrors = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (
          error?.message?.includes('user_not_found') ||
          error?.code === 'user_not_found'
        ) {
          console.log(
            '🚫 Critical: User not found, forcing cleanup and redirect'
          );

          // Clear all auth data immediately
          localStorage.clear();
          sessionStorage.clear();
          document.cookie.split(';').forEach(cookie => {
            const [name] = cookie.split('=');
            if (
              name.trim().includes('supabase') ||
              name.trim().includes('sb-')
            ) {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
            }
          });

          // Force redirect
          window.location.href = '/auth/login';
          return;
        } else if (!user && !error) {
          console.log('🚫 No user found, redirecting to login');
          window.location.href = '/auth/login';
          return;
        }
      } catch (err) {
        console.error('❌ Error in auth error handler:', err);
        // If we can't determine auth state, force redirect
        window.location.href = '/auth/login';
      }
    };

    handleAuthErrors();
  }, []);

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
