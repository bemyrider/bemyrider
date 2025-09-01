'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { directApiCall, getProfileById, getAllProfiles, getEsercenti } from '@/lib/supabase-direct'

export default function TestDirect() {
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const testDirectCalls = async () => {
      try {
        console.log('🚀 Testing direct Supabase API calls...')
        
        // Test 1: Direct profiles query
        console.log('Test 1: Direct profiles API call')
        let profilesData, profilesError
        try {
          profilesData = await getAllProfiles()
          console.log('✅ Direct profiles successful:', profilesData)
        } catch (err: any) {
          profilesError = err
          console.error('❌ Direct profiles failed:', err)
        }

        // Test 2: Direct esercenti query
        console.log('Test 2: Direct esercenti API call')
        let esercentiData, esercentiError
        try {
          esercentiData = await getEsercenti()
          console.log('✅ Direct esercenti successful:', esercentiData)
        } catch (err: any) {
          esercentiError = err
          console.error('❌ Direct esercenti failed:', err)
        }

        // Test 3: Check current user (still using auth)
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          console.error('❌ Auth check failed:', authError)
          setError('No authenticated user')
        } else {
          console.log('✅ User authenticated:', user.id)
          
          // Test 4: Direct user profile query
          console.log('Test 4: Direct user profile API call')
          let userProfile, userProfileError
          try {
            userProfile = await getProfileById(user.id)
            console.log('✅ Direct user profile successful:', userProfile)
          } catch (err: any) {
            userProfileError = err
            console.error('❌ Direct user profile failed:', err)
          }

          setResults([
            { test: 'Direct Profiles', data: profilesData, error: profilesError },
            { test: 'Direct Esercenti', data: esercentiData, error: esercentiError },
            { test: 'Auth', data: user, error: authError },
            { test: 'Direct User Profile', data: userProfile, error: userProfileError }
          ])
        }

      } catch (err: any) {
        console.error('❌ Test failed:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    testDirectCalls()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4">Testing direct API calls...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">🚀 Direct API Test</h1>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h2 className="text-green-800 font-semibold mb-2">🚀 Direct REST API Calls</h2>
          <p className="text-green-700 text-sm">
            This test completely bypasses the Supabase JS client and PostgREST issues by making direct HTTP calls to the Supabase REST API.
            This should work even when PostgREST schema cache is broken.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h2 className="text-red-800 font-semibold">❌ Error:</h2>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {results.map((result, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                {result.error ? '❌' : '✅'} Test: {result.test}
              </h2>
              
              {result.error ? (
                <div className="bg-red-50 p-4 rounded">
                  <p className="text-red-700">Error: {result.error.message || result.error}</p>
                  {result.error.code && <p className="text-red-600 text-sm">Code: {result.error.code}</p>}
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-green-700 mb-2">✅ Success!</p>
                  <pre className="text-xs text-gray-600 overflow-auto max-h-40">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center space-x-4">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            🔄 Reload Tests
          </button>
          <a 
            href="/test-supabase" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
          >
            📊 Compare with RPC Tests
          </a>
        </div>
      </div>
    </div>
  )
}
