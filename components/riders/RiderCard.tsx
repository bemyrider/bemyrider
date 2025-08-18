import Link from 'next/link';
import { Clock, MapPin, Package } from 'lucide-react';
// Avatar sostituito con div semplice
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RatingDisplay } from './RatingDisplay';
import { AvailabilityBadge } from './AvailabilityBadge';
import { TransportationIcon } from './TransportationIcon';
import { RiderCardProps } from '@/lib/types';
import { formatHourlyRate, formatCity } from '@/lib/formatters';

export function RiderCard({ rider, onBook }: RiderCardProps) {
  return (
    <Card className="rider-card h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {rider.avatar_url ? (
                <img
                  src={rider.avatar_url}
                  alt={rider.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-semibold text-lg">
                  {rider.full_name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <CardTitle className="text-xl font-semibold text-gray-900">
                {rider.full_name}
              </CardTitle>
              
              <div className="flex items-center mt-1 text-gray-600">
                <MapPin size={14} className="mr-1" />
                <span className="text-sm">{formatCity(rider.city)}</span>
              </div>
              
              <div className="flex items-center mt-2 gap-2">
                <RatingDisplay rating={rider.rating} size={14} />
              </div>
            </div>
          </div>
          
          <AvailabilityBadge status={rider.availability_status} />
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <CardDescription className="text-gray-600 mb-4 line-clamp-3">
          {rider.bio}
        </CardDescription>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <TransportationIcon type={rider.transportation_method} size={16} />
            <span className="text-gray-700">
              {rider.transportation_method === 'ebike' ? 'E-bike' : 
               rider.transportation_method === 'moto' ? 'Moto' : 'Auto'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Package size={16} className="text-gray-500" />
            <span className="text-gray-700">{rider.total_deliveries} consegne</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t">
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatHourlyRate(rider.hourly_rate)}
            </div>
            <div className="text-xs text-gray-500">
              {rider.years_experience} anni esperienza
            </div>
          </div>
          
          <Link href={`/riders/${rider.id}`}>
            <Button 
              className="ml-4"
              disabled={rider.availability_status !== 'available'}
              onClick={() => onBook(rider.id)}
            >
              <Clock className="h-4 w-4 mr-2" />
              Prenota Rider
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}