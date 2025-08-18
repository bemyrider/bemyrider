import { Star } from 'lucide-react';

interface RatingDisplayProps {
  rating: number;
  showNumeric?: boolean;
  size?: number;
}

export function RatingDisplay({ rating, showNumeric = true, size = 16 }: RatingDisplayProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, index) => (
          <Star
            key={`full-${index}`}
            size={size}
            className="rating-star fill-current"
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star size={size} className="text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star size={size} className="rating-star fill-current" />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <Star
            key={`empty-${index}`}
            size={size}
            className="text-gray-300"
          />
        ))}
      </div>
      
      {showNumeric && (
        <span className="text-sm font-medium text-gray-700 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}