import { Star } from 'lucide-react';
import { useMemo } from 'react';

import './styles.css';

type Props = {
  rating: number;
  maxRating?: number;
  size?: string | number;
  className?: string;
};

const Rating = ({ rating, maxRating = 5, size = '20', className = '' }: Props) => {
  const stars = useMemo(() => {
    const clampedRating = Math.max(0, Math.min(rating, maxRating));
    const roundedRating = Math.round(clampedRating * 2) / 2;
    const sizeNum = typeof size === 'string' ? parseInt(size, 10) : size;

    return Array.from({ length: maxRating }).map((_, index) => {
      const starPosition = index + 1;
      const currentRating = roundedRating - index;

      const isFilled = starPosition <= roundedRating;
      const isHalf = currentRating > 0 && currentRating < 1;
      const fillPercent = isHalf ? currentRating * 100 : isFilled ? 100 : 0;

      if (isHalf) {
        return (
          <div key={index} className="relative" style={{ width: sizeNum, height: sizeNum }}>
            <Star
              size={sizeNum}
              className="absolute top-0 left-0 text-gray-300"
              style={{ fill: 'none' }}
            />
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: `${fillPercent}%` }}
            >
              <Star
                size={sizeNum}
                className="fill-yellow-400 text-yellow-400"
                style={{ fill: '#FFBB00' }}
              />
            </div>
          </div>
        );
      }

      return (
        <div key={index} className={`${isFilled ? 'rating-fill' : ''}`}>
          <Star
            size={sizeNum}
            className={isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            style={{
              fill: isFilled ? '#FFBB00' : 'none',
            }}
          />
        </div>
      );
    });
  }, [rating, maxRating, size]);

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex gap-0.5">{stars}</div>
    </div>
  );
};

export default Rating;
