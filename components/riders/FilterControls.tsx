import { Search, Filter, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@radix-ui/react-select';
import { TransportationType } from '@/lib/enums';
import { FilterControlsProps } from '@/lib/types';
import { formatTransportationType } from '@/lib/formatters';

export function FilterControls({
  searchTerm,
  onSearchChange,
  minRate,
  onMinRateChange,
  maxRate,
  onMaxRateChange,
  selectedCity,
  onCityChange,
  selectedTransportation,
  onTransportationChange,
  onReset
}: FilterControlsProps) {
  const cities = ['', 'milano', 'roma', 'napoli', 'torino', 'bologna', 'firenze'];
  const transportationOptions = ['', ...Object.values(TransportationType)];

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="inline h-4 w-4 mr-1" />
              Cerca
            </label>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Nome o descrizione..."
            />
          </div>

          {/* Min Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Euro className="inline h-4 w-4 mr-1" />
              Tariffa Minima (€/h)
            </label>
            <Input
              type="number"
              value={minRate}
              onChange={(e) => onMinRateChange(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Max Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Euro className="inline h-4 w-4 mr-1" />
              Tariffa Massima (€/h)
            </label>
            <Input
              type="number"
              value={maxRate}
              onChange={(e) => onMaxRateChange(e.target.value)}
              placeholder="100"
            />
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Città
            </label>
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Tutte le città</option>
              {cities.slice(1).map((city) => (
                <option key={city} value={city}>
                  {city.charAt(0).toUpperCase() + city.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Transportation Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mezzo di trasporto
            </label>
            <select
              value={selectedTransportation}
              onChange={(e) => onTransportationChange(e.target.value as TransportationType | "")}
              className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Tutti i mezzi</option>
              {Object.values(TransportationType).map((type) => (
                <option key={type} value={type}>
                  {formatTransportationType(type)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Button */}
        <div className="mt-4 flex justify-end">
          <Button onClick={onReset} variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Reset Filtri
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}