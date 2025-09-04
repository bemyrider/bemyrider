'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSupabase() {
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testQueries = async () => {
      try {
        console.log('🧪 Testing Supabase queries...');

        // Test 1: RPC query to profiles table (bypassing PostgREST)
        console.log('Test 1: RPC profiles query');
        const { data: profilesData, error: profilesError } =
          await supabase.rpc('get_all_profiles');

        if (profilesError) {
          console.error('❌ Profiles RPC query failed:', profilesError);
          setError(`Profiles RPC: ${profilesError.message}`);
        } else {
          console.log('✅ Profiles RPC query successful:', profilesData);
        }

        // Test 2: RPC query to new esercenti table
        console.log('Test 2: RPC esercenti table query');
        const { data: esercentiData, error: esercentiError } =
          await supabase.rpc('get_all_esercenti');

        if (esercentiError) {
          console.error('❌ Esercenti RPC query failed:', esercentiError);
          setError(`Esercenti RPC: ${esercentiError.message}`);
        } else {
          console.log('✅ Esercenti RPC query successful:', esercentiData);
        }

        // Test 3: Check current user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        let userProfile = null;
        let userProfileError = null;

        if (authError || !user) {
          console.error('❌ Auth check failed:', authError);
          setError('No authenticated user');
        } else {
          console.log('✅ User authenticated:', user.id);

          // Test 4: RPC query user-specific profile
          const { data: userProfileArray, error: upError } = await supabase.rpc(
            'get_profile_by_id',
            { profile_id: user.id }
          );

          userProfile =
            userProfileArray && userProfileArray.length > 0
              ? userProfileArray[0]
              : null;
          userProfileError = upError;

          if (userProfileError) {
            console.error(
              '❌ User profile RPC query failed:',
              userProfileError
            );
            setError(`User profile RPC: ${userProfileError.message}`);
          } else {
            console.log('✅ User profile RPC query successful:', userProfile);
          }
        }

        setResults([
          { test: 'Profiles RPC', data: profilesData, error: profilesError },
          { test: 'Esercenti RPC', data: esercentiData, error: esercentiError },
          { test: 'Auth', data: user, error: authError },
          {
            test: 'User Profile RPC',
            data: userProfile,
            error: userProfileError,
          },
        ]);
      } catch (err: any) {
        console.error('❌ Test failed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testQueries();
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4'>Testing Supabase connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='container mx-auto px-4'>
        <h1 className='text-3xl font-bold mb-8'>🧪 Supabase Connection Test</h1>

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
          <h2 className='text-blue-800 font-semibold mb-2'>
            ℹ️ Test RPC Functions
          </h2>
          <p className='text-blue-700 text-sm'>
            This test uses RPC functions to bypass PostgREST&apos;s schema cache
            issues (PGRST002 error). RPC functions work directly with the
            database and should succeed even when regular table queries fail.
          </p>
        </div>

        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
            <h2 className='text-red-800 font-semibold'>❌ Error:</h2>
            <p className='text-red-700'>{error}</p>
          </div>
        )}

        <div className='space-y-6'>
          {results.map((result, index) => (
            <div key={index} className='bg-white rounded-lg shadow p-6'>
              <h2 className='text-xl font-semibold mb-4'>
                {result.error ? '❌' : '✅'} Test: {result.test}
              </h2>

              {result.error ? (
                <div className='bg-red-50 p-4 rounded'>
                  <p className='text-red-700'>Error: {result.error.message}</p>
                  <p className='text-red-600 text-sm'>
                    Code: {result.error.code}
                  </p>
                </div>
              ) : (
                <div className='bg-green-50 p-4 rounded'>
                  <p className='text-green-700 mb-2'>✅ Success!</p>
                  <pre className='text-xs text-gray-600 overflow-auto'>
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className='mt-8 text-center'>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
          >
            🔄 Reload Tests
          </button>
        </div>
      </div>
    </div>
  );
}
