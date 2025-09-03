'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Calendar, Clock, MapPin, MessageSquare } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

type ServiceRequest = {
  id: string
  requested_date: string
  start_time: string
  duration_hours: number
  merchant_address: string
  description: string
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  rider_response: string | null
  created_at: string
  updated_at: string
  rider: {
    id: string
    full_name: string
    avatar_url: string | null
    riders_details: {
      hourly_rate: number | null
      profile_picture_url: string | null
    } | null
  }
}

type EditServiceRequestModalProps = {
  isOpen: boolean
  onClose: () => void
  request: ServiceRequest | null
  onSave: (updatedRequest: Partial<ServiceRequest>) => Promise<void>
}

export default function EditServiceRequestModal({
  isOpen,
  onClose,
  request,
  onSave
}: EditServiceRequestModalProps) {
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    requested_date: '',
    start_time: '',
    duration_hours: '',
    merchant_address: '',
    description: ''
  })

  // Popola il form quando la richiesta cambia
  useEffect(() => {
    if (request) {
      const date = new Date(request.requested_date)
      const dateStr = date.toISOString().split('T')[0]
      const timeStr = request.start_time.substring(0, 5) // Rimuove i secondi
      
      setFormData({
        requested_date: dateStr,
        start_time: timeStr,
        duration_hours: request.duration_hours.toString(),
        merchant_address: request.merchant_address,
        description: request.description
      })
    }
  }, [request])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!request) return

    setLoading(true)
    
    try {
      const updatedData = {
        requested_date: new Date(formData.requested_date + 'T' + formData.start_time).toISOString(),
        start_time: formData.start_time,
        duration_hours: parseFloat(formData.duration_hours),
        merchant_address: formData.merchant_address,
        description: formData.description
      }

      await onSave(updatedData)
      
      toast({
        title: "Richiesta aggiornata",
        description: "La richiesta di servizio è stata modificata con successo"
      })
      
      onClose()
    } catch (error: any) {
      console.error('Error updating request:', error)
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento della richiesta"
      })
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

  if (!isOpen || !request) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">Modifica Richiesta di Servizio</CardTitle>
            <CardDescription>
              Modifica i dettagli della richiesta per {request.rider.full_name}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Data */}
            <div>
              <Label htmlFor="requested_date">Data *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="requested_date"
                  type="date"
                  value={formData.requested_date}
                  onChange={(e) => handleInputChange('requested_date', e.target.value)}
                  className="pl-10"
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {/* Ora */}
            <div>
              <Label htmlFor="start_time">Ora di Inizio *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Durata */}
            <div>
              <Label htmlFor="duration_hours">Durata *</Label>
              <select
                id="duration_hours"
                value={formData.duration_hours}
                onChange={(e) => handleInputChange('duration_hours', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleziona durata</option>
                <option value="1">1 ora</option>
                <option value="2">2 ore</option>
              </select>
            </div>

            {/* Indirizzo */}
            <div>
              <Label htmlFor="merchant_address">Indirizzo di Servizio *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="merchant_address"
                  type="text"
                  value={formData.merchant_address}
                  onChange={(e) => handleInputChange('merchant_address', e.target.value)}
                  placeholder="L'indirizzo completo dove il rider deve presentarsi"
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Può essere l'indirizzo della tua attività o qualsiasi altro indirizzo dove serve il servizio
              </p>
            </div>

            {/* Descrizione */}
            <div>
              <Label htmlFor="description">Istruzioni e Comunicazioni *</Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Inserisci istruzioni specifiche, indirizzi, note particolari o comunicazioni per il rider..."
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Campo obbligatorio - minimo 2 caratteri
              </p>
            </div>

            {/* Riepilogo */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-gray-900">Riepilogo Modifiche</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Data richiesta:</span>
                  <span>{new Date(formData.requested_date).toLocaleDateString('it-IT', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ora di inizio:</span>
                  <span>{formData.start_time}</span>
                </div>
                <div className="flex justify-between">
                  <span>Durata:</span>
                  <span>{formData.duration_hours} {formData.duration_hours === '1' ? 'ora' : 'ore'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Indirizzo:</span>
                  <span className="text-right max-w-xs truncate" title={formData.merchant_address}>
                    {formData.merchant_address}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Costo stimato:</span>
                  <span>€{(request.rider.riders_details?.hourly_rate || 0) * parseFloat(formData.duration_hours || '0')}</span>
                </div>
              </div>
            </div>

            {/* Pulsanti */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={loading || formData.description.trim().length < 2}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvataggio...
                  </>
                ) : (
                  'Salva Modifiche'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
