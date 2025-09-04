import { Badge } from '@/components/ui/badge';
import { AvailabilityStatus } from '@/lib/enums';

interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
}

export function AvailabilityBadge({ status }: AvailabilityBadgeProps) {
  const getStatusText = (status: AvailabilityStatus) => {
    switch (status) {
      case AvailabilityStatus.AVAILABLE:
        return 'Disponibile';
      case AvailabilityStatus.BUSY:
        return 'Occupato';
      case AvailabilityStatus.OFFLINE:
        return 'Non disponibile';
      default:
        return 'Sconosciuto';
    }
  };

  const getVariant = (status: AvailabilityStatus) => {
    switch (status) {
      case AvailabilityStatus.AVAILABLE:
        return 'default' as const;
      case AvailabilityStatus.BUSY:
        return 'secondary' as const;
      case AvailabilityStatus.OFFLINE:
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  return <Badge variant={getVariant(status)}>{getStatusText(status)}</Badge>;
}
