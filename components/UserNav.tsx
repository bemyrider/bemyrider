'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type UserProfile = {
  id: string
  role: 'merchant' | 'rider'
  full_name: string
}

export function UserNav() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    
    // Chiudi dropdown quando si clicca fuori
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        setUser(null)
        setLoading(false)
        return
      }

      // Recupera il profilo per ottenere role e nome
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, full_name')
        .eq('id', authUser.id)
        .single()

      if (profileError || !profileData) {
        setUser(null)
      } else {
        setUser(profileData)
      }
    } catch (error) {
      console.error('Error checking user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setIsDropdownOpen(false)
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const getDashboardPath = () => {
    return user?.role === 'merchant' ? '/dashboard/merchant' : '/dashboard/rider'
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/riders">
          <Button variant="ghost">Trova Rider</Button>
        </Link>
        <div className="w-20 h-10 bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/riders">
          <Button variant="ghost">Trova Rider</Button>
        </Link>
        <Link href="/dashboard">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Accedi</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <Link href="/riders">
        <Button variant="ghost">Trova Rider</Button>
      </Link>
      
      {/* User Menu */}
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="relative"
        >
          <User className="h-5 w-5" />
        </Button>
        
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <div className="py-1">
              <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                <p className="font-medium">{user.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              
              <Link href={getDashboardPath()}>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Dashboard
                </button>
              </Link>
              
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
