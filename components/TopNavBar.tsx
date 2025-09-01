'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Settings, 
  Shield, 
  LogOut, 
  ChevronDown,
  Trash2,
  AlertTriangle
} from 'lucide-react'

interface TopNavBarProps {
  userRole?: 'merchant' | 'rider'
  userName?: string
  onLogout?: () => void
  onDeleteAccount?: () => void
}

export default function TopNavBar({ 
  userRole = 'merchant', 
  userName = 'Utente',
  onLogout,
  onDeleteAccount 
}: TopNavBarProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const router = useRouter()

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsProfileMenuOpen(false)
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/')}>
            <img src="/bemyrider_logo.svg" alt="bemyrider logo" className="h-8 w-auto" />
            <span className="text-2xl font-bold text-gray-900 logo-font">bemyrider</span>
          </div>

          {/* Dashboard Title */}
          <div className="hidden md:flex items-center space-x-2 text-gray-600">
            <div className="h-6 border-l border-gray-300"></div>
            <span className="text-gray-600">
              Dashboard {userRole === 'merchant' ? 'Esercente' : 'Rider'}
            </span>
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center space-x-2 hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {userName}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </Button>

            {/* Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{userName}</p>
                      <p className="text-sm text-gray-500 capitalize">{userRole}</p>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  {/* Profile Settings */}
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <User className="w-4 h-4" />
                    <span>Profilo</span>
                  </button>

                  {/* Settings */}
                  <button
                    onClick={() => handleNavigation('/settings')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Impostazioni</span>
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>

                  {/* Advanced Section */}
                  <div className="px-4 py-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avanzate
                    </p>
                  </div>

                  {/* Privacy & Security */}
                  <button
                    onClick={() => handleNavigation('/privacy')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Privacy e Sicurezza</span>
                  </button>

                  {/* Delete Account - Hidden in advanced section */}
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      onDeleteAccount?.()
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Elimina Account</span>
                    <AlertTriangle className="w-3 h-3 ml-auto" />
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      onLogout?.()
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}

            {/* Overlay to close menu */}
            {isProfileMenuOpen && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsProfileMenuOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
