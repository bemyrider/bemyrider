'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bike, Store } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'rider' | 'merchant' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (!role) {
      setError("Please select your role (Rider or Merchant)")
      setLoading(false)
      return
    }

    try {
      console.log('🚀 Starting registration with role:', role)
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      })

      console.log('📋 Registration data:', data)
      console.log('🔍 User metadata after registration:', data.user?.user_metadata)

      if (signUpError) {
        throw signUpError
      }

      toast({
        title: "Registration successful!",
        description: "You can now log in.",
      })
      
      // Redirect based on role
      if (role === 'merchant') {
        console.log('🏦 Redirecting to merchant dashboard')
        router.push('/dashboard/merchant')
      } else {
        console.log('🚴‍♂️ Redirecting to rider dashboard')
        router.push('/dashboard/rider')
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error)
      setError(error.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <main>
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img src="/bemyrider_logo.svg" alt="bemyrider logo" className="h-8 w-auto" />
              <span className="text-2xl font-bold text-gray-900 logo-font">bemyrider</span>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Create your bemyrider Account</CardTitle>
            <CardDescription className="text-center">Choose your role and start your journey.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Scegli il tuo ruolo
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all ${
                      role === 'rider' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setRole('rider')}
                  >
                    <Bike className="w-8 h-8 mx-auto mb-2" />
                    <div className="font-medium">Rider</div>
                    <div className="text-xs text-gray-600">Effettuo consegne</div>
                  </div>
                  
                  <div 
                    className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all ${
                      role === 'merchant' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setRole('merchant')}
                  >
                    <Store className="w-8 h-8 mx-auto mb-2" />
                    <div className="font-medium">Esercente</div>
                    <div className="text-xs text-gray-600">Richiedo consegne</div>
                  </div>
                </div>
                {!role && error && error.includes("role") && (
                  <p className="text-sm text-red-500 mt-2">⚠️ Seleziona un ruolo per continuare</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registering...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  )
} 