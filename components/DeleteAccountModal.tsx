'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Trash2, X } from 'lucide-react'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  userRole: 'rider' | 'merchant'
}

export default function DeleteAccountModal({ isOpen, onClose, userRole }: DeleteAccountModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [step, setStep] = useState<'warning' | 'confirm' | 'final'>('warning')
  const router = useRouter()

  const expectedConfirmText = 'ELIMINA IL MIO ACCOUNT'

  const handleDelete = async () => {
    if (confirmText !== expectedConfirmText) {
      alert('Testo di conferma non corretto')
      return
    }

    setIsDeleting(true)
    
    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        // Account deleted successfully
        alert('Account eliminato con successo. Arrivederci!')
        router.push('/')
      } else {
        const error = await response.json()
        alert(`Errore: ${error.error || 'Impossibile eliminare l\'account'}`)
      }
    } catch (error) {
      console.error('Delete account error:', error)
      alert('Errore di rete. Riprova.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-red-600">Elimina Account</CardTitle>
          <CardDescription>
            Questa azione è irreversibile
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 'warning' && (
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-800 mb-2">
                  ⚠️ Attenzione: Eliminazione permanente
                </h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Il tuo profilo {userRole === 'merchant' ? 'aziendale' : 'rider'} sarà eliminato</li>
                  <li>• Tutte le prenotazioni saranno cancellate</li>
                  <li>• Le recensioni e valutazioni saranno rimosse</li>
                  {userRole === 'rider' && <li>• I dati fiscali e di disponibilità saranno eliminati</li>}
                  {userRole === 'merchant' && <li>• I dati aziendali e fiscali saranno eliminati</li>}
                  <li>• L'accesso all'account sarà revocato</li>
                  <li>• <strong>Questi dati NON possono essere recuperati</strong></li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annulla
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => setStep('confirm')}
                  className="flex-1"
                >
                  Continua
                </Button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p className="mb-4">
                  Per confermare l'eliminazione del tuo account, 
                  digita esattamente il seguente testo:
                </p>
                <div className="bg-gray-100 p-3 rounded font-mono text-center">
                  {expectedConfirmText}
                </div>
              </div>

              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Digita qui il testo di conferma"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={isDeleting}
              />

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('warning')}
                  className="flex-1"
                  disabled={isDeleting}
                >
                  Indietro
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDelete}
                  className="flex-1"
                  disabled={isDeleting || confirmText !== expectedConfirmText}
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Elimina Account
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
