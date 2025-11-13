import { Star } from 'lucide-react';
import { useMemo } from 'react';

type Props = {
  rating: number;
  maxRating?: number;
  size?: number;
  showHalf?: boolean;
  showText?: boolean;
  textColor?: string;
  starColor?: string;
  emptyStarColor?: string;
  backgroundColor?: string;
  className?: string;
  // so sao hien thi
  showRating?: number;
};

const RatingFill = ({
  rating,
  maxRating = 5,
  size = 24,
  showHalf = true,
  showText = true,
  textColor = '#27364B',
  starColor = '#FFC107',
  emptyStarColor = '#f7e099',
  backgroundColor = '#F9FAFB',
  className = '',
  showRating = 5,
}: Props) => {
  const stars = useMemo(() => {
    const clampedRating = Math.max(0, Math.min(rating, maxRating));

    return Array.from({ length: showRating }).map((_, index) => {
      const diff = clampedRating - index;

      if (diff >= 1) {
        return (
          <Star
            key={index}
            size={size}
            className="fill-current"
            style={{ color: starColor }}
          />
        );
      }

      if (showHalf && diff > 0 && diff < 1) {
        return (
          <div key={index} className="relative" style={{ width: size, height: size }}>
            <Star
              size={size}
              className="absolute top-0 left-0"
              style={{ color: emptyStarColor }}
            />
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: `${diff * 100}%` }}
            >
              <Star
                size={size}
                className="fill-current"
                style={{ color: starColor }}
              />
            </div>
          </div>
        );
      }

      return (
        <Star
          key={index}
          size={size}
          className="text-gray-300"
          style={{ color: emptyStarColor, fill: 'none' }}
        />
      );
    });
  }, [rating, maxRating, size, showHalf, starColor, emptyStarColor, showRating]);

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 ${className}`}
      style={{ backgroundColor }}
    >
      <div className="flex items-center gap-0.5">{stars}</div>
      {showText && (
        <span className="text-sm font-semibold" style={{ color: textColor }}>
          {rating.toFixed(1)}/{maxRating}
        </span>
      )}
    </div>
  );
};

export default RatingFill;
