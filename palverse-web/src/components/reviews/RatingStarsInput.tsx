"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface RatingStarsInputProps {
  value: number;
  onChange: (value: number) => void;
  maxRating?: number;
  size?: number;
  className?: string;
  disabled?: boolean;
}

export function RatingStarsInput({
  value,
  onChange,
  maxRating = 5,
  size = 28,
  className = "",
  disabled = false,
}: RatingStarsInputProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div 
      className={`flex items-center gap-2 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      dir="ltr"
      role="radiogroup"
      aria-label="اختر عدد النجوم"
    >
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hoverRating || value);

        return (
          <button
            key={index}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            disabled={disabled}
            className={`transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E7D4E] rounded-full p-1 ${
              disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
            }`}
            onClick={() => !disabled && onChange(starValue)}
            onMouseEnter={() => !disabled && setHoverRating(starValue)}
            onMouseLeave={() => !disabled && setHoverRating(0)}
            aria-label={`${starValue} نجوم`}
          >
            <Star
              size={size}
              className={`${isFilled ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
            />
          </button>
        );
      })}
    </div>
  );
}
