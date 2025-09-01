'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Save, FileText, MapPin, Calendar, User, AlertCircle, CheckCircle, Calculator } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface FiscalDataModalProps {
  isOpen: boolean
  onClose: () => void
  riderId: string
}

interface FiscalData {
  first_name: string
  last_name: string
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
    first_name: '',
    last_name: '',
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
          first_name: data.first_name || '',
          last_name: data.last_name || '',
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

  // Fiscal code calculation function
  const calculateFiscalCode = () => {
    const { first_name, last_name, birth_date, birth_place } = fiscalData
    
    if (!first_name.trim() || !last_name.trim() || !birth_date || !birth_place.trim()) {
      setMessage({ 
        type: 'error', 
        text: '⚠️ Compila tutti i campi (nome, cognome, data e luogo di nascita) per calcolare il codice fiscale' 
      })
      return
    }

    try {
      // Algoritmo ufficiale calcolo codice fiscale italiano
      
      // 1. COGNOME: Prime 3 consonanti, poi vocali se necessario
      const cleanSurname = last_name.toUpperCase().replace(/\s/g, '')
      const surnameConsonants = extractConsonants(cleanSurname)
      const surnameVowels = extractVowels(cleanSurname)
      let surnameCode = ''
      
      if (surnameConsonants.length >= 3) {
        surnameCode = surnameConsonants.substring(0, 3)
      } else {
        // Se meno di 3 consonanti, aggiungi vocali e poi X se necessario
        surnameCode = (surnameConsonants + surnameVowels + 'XXX').substring(0, 3)
      }
      
      // 2. NOME: Regola speciale - se consonanti >= 4, prendi 1a, 3a, 4a
      const cleanName = first_name.toUpperCase().replace(/\s/g, '')
      const nameConsonants = extractConsonants(cleanName)
      const nameVowels = extractVowels(cleanName)
      let nameCode = ''
      
      if (nameConsonants.length >= 4) {
        // Regola speciale: 1a, 3a, 4a consonante
        nameCode = nameConsonants[0] + nameConsonants[2] + nameConsonants[3]
      } else if (nameConsonants.length >= 3) {
        // Prime 3 consonanti
        nameCode = nameConsonants.substring(0, 3)
      } else {
        // Meno di 3 consonanti: consonanti + vocali + X
        nameCode = (nameConsonants + nameVowels + 'XXX').substring(0, 3)
      }
      
      // 3. ANNO: Ultime 2 cifre
      const year = birth_date.substring(2, 4)
      
      // 4. MESE: Codice lettera
      const month = getMonthCode(parseInt(birth_date.substring(5, 7)))
      
      // 5. GIORNO: Per le donne si aggiunge 40
      const day = birth_date.substring(8, 10)
      
      // 6. CODICE BELFIORE: Mappiamo le principali città italiane
      const cityCode = getCityBelfioreCode(birth_place.toUpperCase())
      
      const partialCode = surnameCode + nameCode + year + month + day + cityCode
      const checkChar = calculateCheckCharacter(partialCode)
      const calculatedCode = partialCode + checkChar
      
      setFiscalData(prev => ({ ...prev, fiscal_code: calculatedCode }))
      setMessage({ 
        type: 'success', 
        text: `✅ Codice fiscale calcolato: ${calculatedCode}. Verifica che sia corretto.` 
      })
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: '❌ Errore nel calcolo del codice fiscale. Inseriscilo manualmente.' 
      })
    }
  }

  const extractConsonants = (str: string): string => {
    return str.replace(/[AEIOU]/g, '')
  }

  const extractVowels = (str: string): string => {
    return str.replace(/[^AEIOU]/g, '')
  }

  const getMonthCode = (month: number): string => {
    // Codici ufficiali dei mesi per il codice fiscale
    const months = [
      'A', // Gennaio
      'B', // Febbraio
      'C', // Marzo
      'D', // Aprile
      'E', // Maggio
      'H', // Giugno
      'L', // Luglio
      'M', // Agosto
      'P', // Settembre
      'R', // Ottobre
      'S', // Novembre
      'T'  // Dicembre
    ]
    return months[month - 1] || 'A'
  }

  const getCityBelfioreCode = (city: string): string => {
    // Mappa dei principali codici Belfiore delle città italiane
    const belfioreMap: { [key: string]: string } = {
      'PALERMO': 'G273',
      'ROMA': 'H501',
      'MILANO': 'F205',
      'NAPOLI': 'F839',
      'TORINO': 'L219',
      'GENOVA': 'D969',
      'BOLOGNA': 'A944',
      'FIRENZE': 'D612',
      'VENEZIA': 'L736',
      'BARI': 'A662',
      'CATANIA': 'C351',
      'VERONA': 'L781',
      'MESSINA': 'F158',
      'PADOVA': 'G224',
      'TRIESTE': 'L424',
      'BRESCIA': 'B157',
      'PARMA': 'G337',
      'PRATO': 'G999',
      'MODENA': 'F257',
      'REGGIO CALABRIA': 'H224',
      'REGGIO EMILIA': 'H223',
      'PERUGIA': 'G478',
      'LIVORNO': 'E625',
      'RAVENNA': 'H199',
      'CAGLIARI': 'B354',
      'FOGGIA': 'D643',
      'RIMINI': 'H294',
      'SALERNO': 'H703',
      'FERRARA': 'D548',
      'SASSARI': 'I452',
      'LATINA': 'E472',
      'GIUGLIANO IN CAMPANIA': 'E058',
      'MONZA': 'F704',
      'SYRACUSA': 'I754',
      'PESCARA': 'G482',
      'BERGAMO': 'A794',
      'FORLÌ': 'D704',
      'TRENTO': 'L378',
      'VICENZA': 'L840',
      'TERNI': 'L112',
      'BOLZANO': 'A952',
      'NOVARA': 'F952',
      'PIACENZA': 'G535',
      'ANCONA': 'A271',
      'ANDRIA': 'A285',
      'AREZZO': 'A390',
      'UDINE': 'L483',
      'CESENA': 'C514',
      'LECCE': 'E506',
      'PESARO': 'G479'
    }
    
    // Prova a trovare il codice esatto
    for (const [cityName, code] of Object.entries(belfioreMap)) {
      if (city.includes(cityName)) {
        return code
      }
    }
    
    // Se non trovato, prova con il codice tra parentesi (es. "Palermo (PA)")
    const parenthesesMatch = city.match(/\(([^)]+)\)/)
    if (parenthesesMatch) {
      const province = parenthesesMatch[1]
      // Mappa delle province principali
      const provinceMap: { [key: string]: string } = {
        'PA': 'G273', // Palermo
        'RM': 'H501', // Roma
        'MI': 'F205', // Milano
        'NA': 'F839', // Napoli
        'TO': 'L219', // Torino
        'GE': 'D969', // Genova
        'BO': 'A944', // Bologna
        'FI': 'D612', // Firenze
        'VE': 'L736', // Venezia
        'BA': 'A662', // Bari
        'CT': 'C351', // Catania
        'VR': 'L781', // Verona
        'ME': 'F158', // Messina
      }
      
      if (provinceMap[province]) {
        return provinceMap[province]
      }
    }
    
    // Default: Roma
    return 'H501'
  }

  const calculateCheckCharacter = (code: string): string => {
    // Algoritmo ufficiale per il carattere di controllo del codice fiscale
    
    // Valori per posizioni DISPARI (1, 3, 5, 7, 9, 11, 13, 15) - indici 0, 2, 4, 6, 8, 10, 12, 14
    const oddLetterValues: { [key: string]: number } = {
      'A': 1, 'B': 0, 'C': 5, 'D': 7, 'E': 9, 'F': 13, 'G': 15, 'H': 17, 'I': 19, 'J': 21,
      'K': 2, 'L': 4, 'M': 18, 'N': 20, 'O': 11, 'P': 3, 'Q': 6, 'R': 8, 'S': 12, 'T': 14,
      'U': 16, 'V': 10, 'W': 22, 'X': 25, 'Y': 24, 'Z': 23
    }
    
    const oddNumberValues: { [key: string]: number } = {
      '0': 1, '1': 0, '2': 5, '3': 7, '4': 9, '5': 13, '6': 15, '7': 17, '8': 19, '9': 21
    }
    
    // Valori per posizioni PARI (2, 4, 6, 8, 10, 12, 14) - indici 1, 3, 5, 7, 9, 11, 13
    const evenLetterValues: { [key: string]: number } = {
      'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9,
      'K': 10, 'L': 11, 'M': 12, 'N': 13, 'O': 14, 'P': 15, 'Q': 16, 'R': 17, 'S': 18, 'T': 19,
      'U': 20, 'V': 21, 'W': 22, 'X': 23, 'Y': 24, 'Z': 25
    }
    
    const evenNumberValues: { [key: string]: number } = {
      '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
    }
    
    // Caratteri di controllo corrispondenti al resto (0-25)
    const checkChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    
    let sum = 0
    
    // Calcola la somma per tutti i 15 caratteri
    for (let i = 0; i < 15; i++) {
      const char = code[i].toUpperCase()
      
      if (i % 2 === 0) {
        // Posizione dispari (1-based): 1, 3, 5, 7, 9, 11, 13, 15
        if (isNaN(parseInt(char))) {
          sum += oddLetterValues[char] || 0
        } else {
          sum += oddNumberValues[char] || 0
        }
      } else {
        // Posizione pari (1-based): 2, 4, 6, 8, 10, 12, 14
        if (isNaN(parseInt(char))) {
          sum += evenLetterValues[char] || 0
        } else {
          sum += evenNumberValues[char] || 0
        }
      }
    }
    
    // Il carattere di controllo è determinato dal resto della divisione per 26
    const remainder = sum % 26
    return checkChars[remainder]
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
      if (!fiscalData.first_name.trim()) {
        throw new Error('⚠️ Il nome è obbligatorio')
      }

      if (!fiscalData.last_name.trim()) {
        throw new Error('⚠️ Il cognome è obbligatorio')
      }

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
        first_name: fiscalData.first_name.trim(),
        last_name: fiscalData.last_name.trim(),
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
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome *
              </Label>
              <Input
                id="firstName"
                type="text"
                value={fiscalData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Es. Mario"
                disabled={loading}
                required
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Cognome *
              </Label>
              <Input
                id="lastName"
                type="text"
                value={fiscalData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Es. Rossi"
                disabled={loading}
                required
              />
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

            {/* Fiscal Code */}
            <div className="space-y-2">
              <Label htmlFor="fiscalCode" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Codice Fiscale *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="fiscalCode"
                  type="text"
                  maxLength={16}
                  value={fiscalData.fiscal_code}
                  onChange={(e) => handleInputChange('fiscal_code', e.target.value.toUpperCase())}
                  placeholder="Es. RSSMRA85M01H501X"
                  className="uppercase flex-1"
                  disabled={loading}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={calculateFiscalCode}
                  disabled={loading}
                  className="shrink-0"
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  Calcola
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                16 caratteri alfanumerici (lettere maiuscole e numeri)
              </p>
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
