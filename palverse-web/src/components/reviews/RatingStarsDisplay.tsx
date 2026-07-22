import { Star } from "lucide-react";

interface RatingStarsDisplayProps {
  rating: number; // 1-5
  maxRating?: number;
  size?: number;
  className?: string;
  starClassName?: string;
  filledClassName?: string;
  emptyClassName?: string;
}

export function RatingStarsDisplay({
  rating,
  maxRating = 5,
  size = 16,
  className = "",
  starClassName = "",
  filledClassName = "text-yellow-400 fill-yellow-400",
  emptyClassName = "text-gray-300",
}: RatingStarsDisplayProps) {
  // Ensure rating is between 0 and maxRating
  const safeRating = Math.max(0, Math.min(rating, maxRating));
  const fullStars = Math.floor(safeRating);
  const hasHalfStar = safeRating % 1 !== 0;

  return (
    <div className={`flex items-center gap-1 ${className}`} dir="ltr" aria-label={`التقييم: ${rating} من ${maxRating}`}>
      {[...Array(maxRating)].map((_, index) => {
        const isFilled = index < fullStars;
        const isHalf = index === fullStars && hasHalfStar;

        if (isHalf) {
          // Simplistic half-star rendering for now, can be improved with SVG clip-path if needed
          return (
            <div key={index} className="relative">
              <Star size={size} className={`${starClassName} ${emptyClassName}`} />
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star size={size} className={`${starClassName} ${filledClassName}`} />
              </div>
            </div>
          );
        }

        return (
          <Star
            key={index}
            size={size}
            className={`${starClassName} ${isFilled ? filledClassName : emptyClassName}`}
          />
        );
      })}
    </div>
  );
}
