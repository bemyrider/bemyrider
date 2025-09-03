'use client'

import { useState } from 'react'
import { Search, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LocationFilterProps {
  onLocationChange: (location: string) => void
  currentLocation?: string
  popularLocations?: string[]
}

export default function LocationFilter({ 
  onLocationChange, 
  currentLocation = '',
  popularLocations = ['Milano', 'Roma', 'Torino', 'Napoli', 'Bologna', 'Firenze']
}: LocationFilterProps) {
  const [location, setLocation] = useState(currentLocation)

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation)
    onLocationChange(newLocation)
  }

  const handleQuickSelect = (city: string) => {
    handleLocationChange(city)
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border shadow-sm">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-blue-600" />
        <Label htmlFor="location-search" className="text-sm font-medium">
          Cerca rider nella tua città
        </Label>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          id="location-search"
          type="text"
          placeholder="Inserisci città o località..."
          value={location}
          onChange={(e) => handleLocationChange(e.target.value)}
          className="pl-10"
          maxLength={100}
        />
      </div>

      {/* Località popolari */}
      <div className="space-y-2">
        <Label className="text-xs text-gray-500">Città popolari:</Label>
        <div className="flex flex-wrap gap-2">
          {popularLocations.map((city) => (
            <Button
              key={city}
              variant={location === city ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuickSelect(city)}
              className="text-xs"
            >
              {city}
            </Button>
          ))}
        </div>
      </div>

      {location && (
        <div className="text-sm text-gray-600">
          🔍 Cercando rider a: <span className="font-medium">{location}</span>
        </div>
      )}
    </div>
  )
}
