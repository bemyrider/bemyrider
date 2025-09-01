'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Save, FileText, MapPin, Calendar, User, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface FiscalDataModalProps {
  isOpen: boolean
  onClose: () => void
  riderId: string
}

interface FiscalData {
  fiscal_code: string
  birth_place: string
  birth_date: string
  residence_address: string
  residence_city: string
}

interface Message {
  type: 'success' | 'error'
  text: string
}

export default function FiscalDataModal({ isOpen, onClose, riderId }: FiscalDataModalProps) {
  const [fiscalData, setFiscalData] = useState<FiscalData>({
    fiscal_code: '',
    birth_place: '',
    birth_date: '',
    residence_address: '',
    residence_city: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)

  // Fetch existing fiscal data
  useEffect(() => {
    if (isOpen && riderId) {
      fetchFiscalData()
    }
  }, [isOpen, riderId])

  const fetchFiscalData = async () => {
    try {
      const { data, error } = await supabase
        .from('rider_tax_details')
        .select('*')
        .eq('rider_id', riderId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching fiscal data:', error)
        return
      }

      if (data) {
        setFiscalData({
          fiscal_code: data.fiscal_code || '',
          birth_place: data.birth_place || '',
          birth_date: data.birth_date || '',
          residence_address: data.residence_address || '',
          residence_city: data.residence_city || ''
        })
      }
    } catch (error) {
      console.error('Error fetching fiscal data:', error)
    }
  }

  const validateFiscalCode = (code: string): boolean => {
    // Basic Italian fiscal code validation (16 characters, alphanumeric)
    const fiscalCodeRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/
    return fiscalCodeRegex.test(code.toUpperCase())
  }

  const handleInputChange = (field: keyof FiscalData, value: string) => {
    setFiscalData(prev => ({ ...prev, [field]: value }))
    
    // Clear message when user starts typing
    if (message?.type === 'error') {
      setMessage(null)
    }

    // Real-time fiscal code validation
    if (field === 'fiscal_code' && value.length > 0) {
      const upperValue = value.toUpperCase()
      if (value.length === 16 && !validateFiscalCode(upperValue)) {
        setMessage({ type: 'error', text: '⚠️ Codice fiscale non valido. Controlla il formato (16 caratteri)' })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Validation
      if (!fiscalData.fiscal_code.trim()) {
        throw new Error('⚠️ Il codice fiscale è obbligatorio')
      }

      if (!validateFiscalCode(fiscalData.fiscal_code.toUpperCase())) {
        throw new Error('⚠️ Codice fiscale non valido. Deve essere di 16 caratteri nel formato corretto')
      }

      if (!fiscalData.birth_place.trim()) {
        throw new Error('⚠️ Il luogo di nascita è obbligatorio')
      }

      if (!fiscalData.birth_date.trim()) {
        throw new Error('⚠️ La data di nascita è obbligatoria')
      }

      if (!fiscalData.residence_address.trim()) {
        throw new Error('⚠️ L\'indirizzo di residenza è obbligatorio')
      }

      if (!fiscalData.residence_city.trim()) {
        throw new Error('⚠️ La città di residenza è obbligatoria')
      }

      // Prepare data for upsert
      const dataToSave = {
        rider_id: riderId,
        fiscal_code: fiscalData.fiscal_code.toUpperCase(),
        birth_place: fiscalData.birth_place.trim(),
        birth_date: fiscalData.birth_date,
        residence_address: fiscalData.residence_address.trim(),
        residence_city: fiscalData.residence_city.trim()
      }

      // Upsert fiscal data
      const { error } = await supabase
        .from('rider_tax_details')
        .upsert(dataToSave, { onConflict: 'rider_id' })

      if (error) {
        console.error('Error saving fiscal data:', error)
        throw new Error('❌ Errore durante il salvataggio. Riprova.')
      }

      setMessage({ 
        type: 'success', 
        text: '✅ Dati fiscali salvati con successo!' 
      })

      // Close modal after success
      setTimeout(() => {
        onClose()
      }, 1500)

    } catch (error: any) {
      console.error('Error saving fiscal data:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || '❌ Errore durante il salvataggio. Riprova.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setMessage(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dati Fiscali
            </CardTitle>
            <CardDescription>
              Inserisci i tuoi dati fiscali per la fatturazione e la compliance
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          {message && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Fiscal Code */}
            <div className="space-y-2">
              <Label htmlFor="fiscalCode" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Codice Fiscale *
              </Label>
              <Input
                id="fiscalCode"
                type="text"
                maxLength={16}
                value={fiscalData.fiscal_code}
                onChange={(e) => handleInputChange('fiscal_code', e.target.value.toUpperCase())}
                placeholder="Es. RSSMRA85M01H501X"
                className="uppercase"
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500">
                16 caratteri alfanumerici (lettere maiuscole e numeri)
              </p>
            </div>

            {/* Birth Place */}
            <div className="space-y-2">
              <Label htmlFor="birthPlace" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Luogo di Nascita *
              </Label>
              <Input
                id="birthPlace"
                type="text"
                value={fiscalData.birth_place}
                onChange={(e) => handleInputChange('birth_place', e.target.value)}
                placeholder="Es. Roma (RM)"
                disabled={loading}
                required
              />
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data di Nascita *
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={fiscalData.birth_date}
                onChange={(e) => handleInputChange('birth_date', e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Residence Address */}
            <div className="space-y-2">
              <Label htmlFor="residenceAddress" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Indirizzo di Residenza *
              </Label>
              <Input
                id="residenceAddress"
                type="text"
                value={fiscalData.residence_address}
                onChange={(e) => handleInputChange('residence_address', e.target.value)}
                placeholder="Es. Via Roma, 123"
                disabled={loading}
                required
              />
            </div>

            {/* Residence City */}
            <div className="space-y-2">
              <Label htmlFor="residenceCity" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Città di Residenza *
              </Label>
              <Input
                id="residenceCity"
                type="text"
                value={fiscalData.residence_city}
                onChange={(e) => handleInputChange('residence_city', e.target.value)}
                placeholder="Es. Milano (MI)"
                disabled={loading}
                required
              />
            </div>

            {/* Information Panel */}
            <div className="mt-6 bg-blue-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Informazioni Importanti
              </h4>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• <strong>Privacy:</strong> I dati sono protetti secondo il GDPR</li>
                <li>• <strong>Uso:</strong> Utilizzati solo per fatturazione e compliance fiscale</li>
                <li>• <strong>Sicurezza:</strong> Trasmissione e archiviazione crittografate</li>
                <li>• <strong>Modifiche:</strong> Puoi aggiornare i dati in qualsiasi momento</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Salvataggio...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Salva Dati Fiscali
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
