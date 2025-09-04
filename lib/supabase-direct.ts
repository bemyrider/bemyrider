// Direct Supabase API calls to bypass PostgREST issues
import { supabase } from './supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

export async function directApiCall(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: any
) {
  try {
    // Get current session for auth
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, config);

    if (!response.ok) {
      throw new Error(
        `API call failed: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Direct API call failed:', error);
    throw error;
  }
}

// Helper functions for common operations
export async function getProfileById(userId: string) {
  try {
    const data = await directApiCall(`profiles?id=eq.${userId}`);
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Failed to get profile:', error);
    return null;
  }
}

export async function getAllProfiles() {
  try {
    return await directApiCall('profiles?limit=10');
  } catch (error) {
    console.error('Failed to get profiles:', error);
    return [];
  }
}

export async function getEsercenti() {
  try {
    return await directApiCall('esercenti?limit=10');
  } catch (error) {
    console.error('Failed to get esercenti:', error);
    return [];
  }
}

export async function createProfile(profile: any) {
  try {
    return await directApiCall('profiles', 'POST', profile);
  } catch (error) {
    console.error('Failed to create profile:', error);
    throw error;
  }
}
