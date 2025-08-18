import { PlugZap, CarTaxiFront, Truck } from 'lucide-react';
import { TransportationType } from '@/lib/enums';

interface TransportationIconProps {
  type: TransportationType;
  size?: number;
}

export function TransportationIcon({ type, size = 20 }: TransportationIconProps) {
  const getIcon = () => {
    switch (type) {
      case TransportationType.EBIKE:
        return <PlugZap size={size} className="transport-ebike" />;
      case TransportationType.MOTO:
        return <CarTaxiFront size={size} className="transport-moto" />;
      case TransportationType.AUTO:
        return <Truck size={size} className="transport-auto" />;
      default:
        return <PlugZap size={size} className="text-gray-400" />;
    }
  };

  return getIcon();
}