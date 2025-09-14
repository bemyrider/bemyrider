import { supabase } from './supabase';
import { notifications } from './notifications';

export interface AuthError {
  code: string;
  message: string;
  status?: number;
}

export const isAuthError = (error: any): boolean => {
  return (
    error?.code === 'PGRST301' || // JWT expired
    error?.code === 'PGRST302' || // JWT invalid
    error?.status === 401 || // Unauthorized
    error?.status === 403 || // Forbidden
    error?.message?.includes('JWT')
  );
};

export const refreshSession = async (): Promise<boolean> => {
  try {
    console.log('🔄 Refreshing session...');
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error('❌ Failed to refresh session:', error);
      return false;
    }

    if (data.session) {
      console.log('✅ Session refreshed successfully');
      return true;
    }

    console.warn('⚠️ No session returned after refresh');
    return false;
  } catch (error) {
    console.error('❌ Error during session refresh:', error);
    return false;
  }
};

export const executeWithAuthRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 1
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Verifica se l'utente è ancora autenticato prima dell'operazione
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const result = await operation();
      return result;
    } catch (error: any) {
      lastError = error;

      // Se è un errore di auth e abbiamo ancora tentativi, prova il refresh
      if (isAuthError(error) && attempt < maxRetries) {
        console.log(
          `🔄 Auth error detected, attempting refresh (attempt ${attempt + 1}/${maxRetries + 1})`
        );

        const refreshSuccess = await refreshSession();
        if (!refreshSuccess) {
          throw new Error('Failed to refresh session');
        }

        // Aspetta un po' prima di riprovare
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      // Se non è un errore di auth o abbiamo esaurito i tentativi, rilancia l'errore
      throw error;
    }
  }

  throw lastError;
};

export const handleAuthError = (error: any, router: any) => {
  if (isAuthError(error)) {
    console.log('🚫 Authentication error detected, redirecting to login');
    router.push('/auth/login');
    return true;
  }

  // Handle specific Supabase errors
  if (
    error?.message?.includes('user_not_found') ||
    error?.code === 'user_not_found'
  ) {
    console.error('👤 User not found in Supabase database - clearing session');
    notifications.error('Sessione scaduta. Effettua nuovamente il login.', {
      title: 'Utente non trovato',
    });

    // Clear any stale session data
    supabase.auth.signOut();

    // Force page reload to clear any cached state
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }

    return true;
  }

  if (
    error?.message?.includes('invalid_token') ||
    error?.code === 'invalid_token'
  ) {
    console.error('🔑 Invalid token - clearing session');
    notifications.error(
      'Token di autenticazione non valido. Rieffettua il login.',
      {
        title: 'Token invalido',
      }
    );

    supabase.auth.signOut();

    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }

    return true;
  }

  return false;
};

export const checkAuthState = async (): Promise<{
  isAuthenticated: boolean;
  user: any;
}> => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Error checking auth state:', error);
      return { isAuthenticated: false, user: null };
    }

    return { isAuthenticated: !!user, user };
  } catch (error) {
    console.error('Error in checkAuthState:', error);
    return { isAuthenticated: false, user: null };
  }
};

/**
 * Force logout and clear all authentication data
 * Useful when dealing with corrupted sessions or stale tokens
 */
export const forceLogout = async (): Promise<void> => {
  try {
    console.log('🚪 Forcing logout and clearing all auth data...');

    // Sign out from Supabase
    await supabase.auth.signOut();

    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();

      // Clear any Supabase-related cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.split('=');
        if (name.trim().includes('supabase') || name.trim().includes('sb-')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        }
      });
    }

    console.log('✅ Auth data cleared successfully');

    // Show success notification
    notifications.success(
      'Logout completato. Tutti i dati di autenticazione sono stati cancellati.',
      {
        title: 'Logout forzato',
      }
    );
  } catch (error) {
    console.error('❌ Error during force logout:', error);
    notifications.error('Errore durante il logout forzato.', {
      title: 'Errore',
    });
  }
};
