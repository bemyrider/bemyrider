'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Building2, MapPin, FileText, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type MerchantFiscalData = {
  esercente_id: string
  company_name: string | null
  vat_number: string | null
  address: string | null
  city: string | null
}

type FiscalDataMerchantModalProps = {
  isOpen: boolean
  onClose: () => void
  profileId: string
  onFiscalDataUpdated: (data: MerchantFiscalData) => void
}

export default function FiscalDataMerchantModal({
  isOpen,
  onClose,
  profileId,
  onFiscalDataUpdated
}: FiscalDataMerchantModalProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    companyName: '',
    vatNumber: '',
    address: '',
    city: ''
  })

  // Carica i dati fiscali esistenti
  useEffect(() => {
    if (isOpen && profileId) {
      fetchFiscalData()
    }
  }, [isOpen, profileId])

  const fetchFiscalData = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('esercente_tax_details')
        .select('*')
        .eq('esercente_id', profileId)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // Nessun profilo fiscale trovato, inizializza con valori vuoti
          console.log('📝 Nessun profilo fiscale trovato, inizializzazione...')
          setFormData({
            companyName: '',
            vatNumber: '',
            address: '',
            city: ''
          })
        } else {
          throw fetchError
        }
      } else {
        console.log('📋 Dati fiscali caricati:', data)
        setFormData({
          companyName: data.company_name || '',
          vatNumber: data.vat_number || '',
          address: data.address || '',
          city: data.city || ''
        })
      }
    } catch (error: any) {
      console.error('❌ Errore nel caricamento dei dati fiscali:', error)
      setError('Errore nel caricamento dei dati fiscali')
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

  const validateVatNumber = (vat: string): boolean => {
    // Validazione base per partita IVA italiana (11 cifre)
    const cleanVat = vat.replace(/\s/g, '')
    return /^\d{11}$/.test(cleanVat)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Validazione
      if (formData.vatNumber && !validateVatNumber(formData.vatNumber)) {
        setError('La partita IVA deve essere composta da 11 cifre')
        return
      }

      console.log('💾 Salvando dati fiscali merchant...', formData)

      // Controlla se esistono già dati fiscali
      const { data: existingData } = await supabase
        .from('esercente_tax_details')
        .select('esercente_id')
        .eq('esercente_id', profileId)
        .single()

      let result
      if (existingData) {
        // Aggiorna dati esistenti
        result = await supabase
          .from('esercente_tax_details')
          .update({
            company_name: formData.companyName.trim() || null,
            vat_number: formData.vatNumber.trim() || null,
            address: formData.address.trim() || null,
            city: formData.city.trim() || null
          })
          .eq('esercente_id', profileId)
          .select()
          .single()
      } else {
        // Crea nuovi dati fiscali
        result = await supabase
          .from('esercente_tax_details')
          .insert({
            esercente_id: profileId,
            company_name: formData.companyName.trim() || null,
            vat_number: formData.vatNumber.trim() || null,
            address: formData.address.trim() || null,
            city: formData.city.trim() || null
          })
          .select()
          .single()
      }

      if (result.error) {
        throw result.error
      }

      console.log('✅ Dati fiscali salvati con successo:', result.data)
      setSuccess('Dati fiscali salvati con successo!')
      
      // Notifica il componente padre
      onFiscalDataUpdated(result.data)

      // Chiudi il modal dopo un breve delay
      setTimeout(() => {
        onClose()
      }, 1500)

    } catch (error: any) {
      console.error('❌ Errore nel salvataggio dei dati fiscali:', error)
      setError(error.message || 'Errore nel salvataggio dei dati fiscali')
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
            <Building2 className="h-6 w-6 text-green-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Dati Fiscali</h2>
              <p className="text-sm text-gray-600">Informazioni fiscali per fatturazione e ricevute</p>
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Caricamento dati fiscali...</p>
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

              {/* Fiscal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Informazioni Aziendali
                  </CardTitle>
                  <CardDescription>
                    Dati necessari per la fatturazione e le ricevute fiscali
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Ragione Sociale</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="es. Mario Rossi S.r.l."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="vatNumber">Partita IVA</Label>
                    <Input
                      id="vatNumber"
                      value={formData.vatNumber}
                      onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                      placeholder="12345678901"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      11 cifre senza spazi (es. 12345678901)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Indirizzo Fiscale
                  </CardTitle>
                  <CardDescription>
                    Indirizzo per documenti fiscali e ricevute
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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

              {/* Info Box */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Informazioni Importanti</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Questi dati saranno utilizzati per generare ricevute fiscali e documenti di pagamento. 
                        Assicurati che le informazioni siano corrette e aggiornate.
                      </p>
                    </div>
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
            className="bg-green-600 hover:bg-green-700"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salva Dati Fiscali
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
