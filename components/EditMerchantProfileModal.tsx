'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Store, MapPin, Phone, FileText, Upload, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type MerchantBusinessData = {
  id: string
  business_name: string
  address: string | null
  city: string | null
  phone_number: string | null
  description: string | null
  profile_picture_url: string | null
}

type EditMerchantProfileModalProps = {
  isOpen: boolean
  onClose: () => void
  profileId: string
  onProfileUpdated: (profile: MerchantBusinessData) => void
}

export default function EditMerchantProfileModal({
  isOpen,
  onClose,
  profileId,
  onProfileUpdated
}: EditMerchantProfileModalProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    businessName: '',
    address: '',
    city: '',
    phoneNumber: '',
    description: '',
    profilePictureUrl: ''
  })

  // Carica i dati esistenti del merchant
  useEffect(() => {
    if (isOpen && profileId) {
      fetchMerchantProfile()
    }
  }, [isOpen, profileId])

  const fetchMerchantProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('esercenti')
        .select('*')
        .eq('id', profileId)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // Nessun profilo trovato, inizializza con valori vuoti
          console.log('📝 Nessun profilo merchant trovato, inizializzazione...')
          setFormData({
            businessName: '',
            address: '',
            city: '',
            phoneNumber: '',
            description: '',
            profilePictureUrl: ''
          })
        } else {
          throw fetchError
        }
      } else {
        console.log('📋 Profilo merchant caricato:', data)
        setFormData({
          businessName: data.business_name || '',
          address: data.address || '',
          city: data.city || '',
          phoneNumber: data.phone_number || '',
          description: data.description || '',
          profilePictureUrl: data.profile_picture_url || ''
        })
      }
    } catch (error: any) {
      console.error('❌ Errore nel caricamento del profilo merchant:', error)
      setError('Errore nel caricamento del profilo')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Validazione
      if (!formData.businessName.trim()) {
        setError('Il nome dell\'attività è obbligatorio')
        return
      }

      console.log('💾 Salvando profilo merchant...', formData)

      // Controlla se esiste già un profilo
      const { data: existingProfile } = await supabase
        .from('esercenti')
        .select('id')
        .eq('id', profileId)
        .single()

      let result
      if (existingProfile) {
        // Aggiorna profilo esistente
        result = await supabase
          .from('esercenti')
          .update({
            business_name: formData.businessName.trim(),
            address: formData.address.trim() || null,
            city: formData.city.trim() || null,
            phone_number: formData.phoneNumber.trim() || null,
            description: formData.description.trim() || null,
            profile_picture_url: formData.profilePictureUrl.trim() || null
          })
          .eq('id', profileId)
          .select()
          .single()
      } else {
        // Crea nuovo profilo
        result = await supabase
          .from('esercenti')
          .insert({
            id: profileId,
            business_name: formData.businessName.trim(),
            address: formData.address.trim() || null,
            city: formData.city.trim() || null,
            phone_number: formData.phoneNumber.trim() || null,
            description: formData.description.trim() || null,
            profile_picture_url: formData.profilePictureUrl.trim() || null
          })
          .select()
          .single()
      }

      if (result.error) {
        throw result.error
      }

      console.log('✅ Profilo merchant salvato con successo:', result.data)
      setSuccess('Profilo salvato con successo!')
      
      // Notifica il componente padre
      onProfileUpdated(result.data)

      // Chiudi il modal dopo un breve delay
      setTimeout(() => {
        onClose()
      }, 1500)

    } catch (error: any) {
      console.error('❌ Errore nel salvataggio del profilo merchant:', error)
      setError(error.message || 'Errore nel salvataggio del profilo')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Store className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Profilo Attività</h2>
              <p className="text-sm text-gray-600">Modifica le informazioni della tua attività</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Caricamento profilo...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* Error/Success Messages */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  {success}
                </div>
              )}

              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Informazioni Attività
                  </CardTitle>
                  <CardDescription>
                    Dettagli principali della tua attività commerciale
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Nome Attività *</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder="es. Pizzeria da Mario"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrizione</Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Descrivi la tua attività, specialità, servizi offerti..."
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="profilePictureUrl">URL Immagine Profilo</Label>
                    <Input
                      id="profilePictureUrl"
                      value={formData.profilePictureUrl}
                      onChange={(e) => handleInputChange('profilePictureUrl', e.target.value)}
                      placeholder="https://esempio.com/immagine.jpg"
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Informazioni di Contatto
                  </CardTitle>
                  <CardDescription>
                    Dati per permettere ai rider di contattarti
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="phoneNumber">Numero di Telefono</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="+39 123 456 7890"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Indirizzo</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Via Roma, 123"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">Città</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Milano"
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Annulla
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salva Profilo
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
