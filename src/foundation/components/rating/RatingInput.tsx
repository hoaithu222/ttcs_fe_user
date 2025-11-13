import { useState } from 'react';
import { Star } from 'lucide-react';

type Props = {
  value?: number;
  onChange?: (rating: number) => void;
  maxRating?: number;
  size?: number;
  starColor?: string;
  emptyStarColor?: string;
  hoverColor?: string;
  showLabel?: boolean;
  label?: string;
  allowHalf?: boolean;
  allowClear?: boolean;
  disabled?: boolean;
  className?: string;
};

const RatingInput = ({
  value = 0,
  onChange,
  maxRating = 5,
  size = 32,
  starColor = '#FFC107',
  emptyStarColor = '#D1D5DB',
  hoverColor = '#FFD54F',
  showLabel = true,
  label = 'Nhấn vào sao để đánh giá',
  allowHalf = false,
  allowClear = true,
  disabled = false,
  className = '',
}: Props) => {
  const [hoverRating, setHoverRating] = useState<number>(0);

  const handleMouseMove = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    if (allowHalf) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const isHalf = x < rect.width / 2;
      setHoverRating(isHalf ? index + 0.5 : index + 1);
    } else {
      setHoverRating(index + 1);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleClick = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    let newRating: number;

    if (allowHalf) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const isHalf = x < rect.width / 2;
      newRating = isHalf ? index + 0.5 : index + 1;
    } else {
      newRating = index + 1;
    }

    // Nếu click vào sao đã chọn và allowClear = true thì clear rating
    if (allowClear && newRating === value) {
      newRating = 0;
    }

    onChange?.(newRating);
  };

  const getStarFill = (index: number) => {
    const currentRating = hoverRating || value;
    const diff = currentRating - index;

    if (diff >= 1) return 1; // Full star
    if (diff > 0 && diff < 1) return diff; // Partial star
    return 0; // Empty star
  };

  const getStarColor = (index: number) => {
    if (hoverRating > 0) {
      return index < hoverRating ? hoverColor : emptyStarColor;
    }
    return index < value ? starColor : emptyStarColor;
  };

  const getLabelText = () => {
    const currentRating = hoverRating || value;
    if (currentRating === 0) return label;

    const labels = ['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt'];
    const index = Math.ceil(currentRating) - 1;
    return labels[index] || label;
  };

  return (
    <div className={`inline-flex flex-col items-center gap-3 ${className}`}>
      <div
        className={`flex items-center gap-1 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxRating }).map((_, index) => {
          const fill = getStarFill(index);
          const color = getStarColor(index);

          return (
            <div
              key={index}
              className="relative transition-transform hover:scale-110"
              onMouseMove={(e) => handleMouseMove(index, e)}
              onClick={(e) => handleClick(index, e)}
            >
              {/* Empty star background */}
              <Star
                size={size}
                className="text-gray-300"
                style={{ color: emptyStarColor, fill: 'none' }}
              />

              {/* Filled star overlay */}
              {fill > 0 && (
                <div
                  className="absolute top-0 left-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Star
                    size={size}
                    className="fill-current"
                    style={{ color }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showLabel && <span className="text-xs font-medium text-slate-600">{getLabelText()}</span>}
    </div>
  );
};

export default RatingInput;
