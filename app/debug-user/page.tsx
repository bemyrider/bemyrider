'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugUserPage() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [profileInfo, setProfileInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          console.log('No user logged in')
          setLoading(false)
          return
        }

        setUserInfo(user)

        // Get profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.log('Profile error:', profileError)
          setProfileInfo({ error: profileError.message })
        } else {
          setProfileInfo(profileData)
        }

      } catch (error) {
        console.error('Debug error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const createMerchantProfile = async () => {
    if (!userInfo) return

    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userInfo.id,
          full_name: userInfo.user_metadata.full_name || userInfo.email?.split('@')[0] || 'New Merchant',
          role: 'merchant',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error creating merchant profile:', error)
        alert('Error: ' + error.message)
      } else {
        alert('Merchant profile created successfully!')
        window.location.reload()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const updateToMerchant = async () => {
    if (!userInfo) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role: 'merchant',
          updated_at: new Date().toISOString()
        })
        .eq('id', userInfo.id)

      if (error) {
        console.error('Error updating to merchant:', error)
        alert('Error: ' + error.message)
      } else {
        alert('Profile updated to merchant successfully!')
        window.location.reload()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!userInfo) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug User Info</h1>
        <p>No user logged in. Please <a href="/auth/login" className="text-blue-600 underline">login</a> first.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">🔍 Debug User Information</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🔐 Auth User Data</CardTitle>
            <CardDescription>Information from Supabase Auth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>ID:</strong> {userInfo.id}</p>
              <p><strong>Email:</strong> {userInfo.email}</p>
              <p><strong>Created:</strong> {new Date(userInfo.created_at).toLocaleString()}</p>
              <p><strong>Last Sign In:</strong> {new Date(userInfo.last_sign_in_at).toLocaleString()}</p>
              
              <div className="mt-4">
                <strong>User Metadata:</strong>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(userInfo.user_metadata, null, 2)}
                </pre>
              </div>
              
              <div className="mt-4">
                <strong>App Metadata:</strong>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(userInfo.app_metadata, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>👤 Profile Data</CardTitle>
            <CardDescription>Information from profiles table</CardDescription>
          </CardHeader>
          <CardContent>
            {profileInfo?.error ? (
              <div>
                <p className="text-red-600 mb-4">Error: {profileInfo.error}</p>
                <Button onClick={createMerchantProfile} className="w-full">
                  Create Merchant Profile
                </Button>
              </div>
            ) : profileInfo ? (
              <div className="space-y-2 text-sm">
                <p><strong>ID:</strong> {profileInfo.id}</p>
                <p><strong>Full Name:</strong> {profileInfo.full_name}</p>
                <p><strong>Role:</strong> <span className={`px-2 py-1 rounded ${
                  profileInfo.role === 'merchant' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>{profileInfo.role}</span></p>
                <p><strong>Avatar URL:</strong> {profileInfo.avatar_url || 'None'}</p>
                <p><strong>Created:</strong> {new Date(profileInfo.created_at).toLocaleString()}</p>
                <p><strong>Updated:</strong> {new Date(profileInfo.updated_at).toLocaleString()}</p>
                
                {profileInfo.role !== 'merchant' && (
                  <div className="mt-4">
                    <Button onClick={updateToMerchant} className="w-full">
                      Update to Merchant Role
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p>No profile data found</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>🚀 Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Button onClick={() => window.location.href = '/dashboard/merchant'}>
              Go to Merchant Dashboard
            </Button>
            <Button onClick={() => window.location.href = '/dashboard/rider'}>
              Go to Rider Dashboard
            </Button>
            <Button variant="outline" onClick={() => supabase.auth.signOut()}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>📋 Expected vs Actual Role</CardTitle>
          <CardDescription>Comparison between intended role and database role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Intended Role (from signup):</p>
              <p className="text-lg">
                {userInfo.user_metadata?.role || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="font-medium">Actual Role (from database):</p>
              <p className="text-lg">
                {profileInfo?.role || 'No profile found'}
              </p>
            </div>
          </div>
          
          {userInfo.user_metadata?.role !== profileInfo?.role && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800">
                ⚠️ <strong>Mismatch detected!</strong> The intended role doesn't match the database role.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
