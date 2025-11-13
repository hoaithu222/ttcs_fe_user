import { useMemo } from 'react';
import RatingBar from './RatingBar';

type RatingDistributionProps = {
  /** Mảng các đối tượng rating, mỗi phần gồm { stars, count } */
  ratings: { stars: number; count: number }[];

  /** Số sao tối đa (mặc định là 5) */
  maxStars?: number;

  /** Màu thanh chính — mặc định vàng (#FFC107) */
  barColor?: string;

  /** Màu nền thanh — mặc định xám (#E5E7EB) */
  backgroundColor?: string;

  /** Chiều cao thanh (px) — mặc định 8 */
  height?: number;

  /** Hiển thị phần trăm (%) thay vì số lượng — mặc định false */
  showPercentage?: boolean;

  /** Thêm class tùy chỉnh (ví dụ: spacing, margin...) */
  className?: string;
};

const RatingDistribution = ({
  ratings,
  maxStars = 5,
  barColor = '#FFC107',
  backgroundColor = '#E5E7EB',
  height = 8,
  showPercentage = false,
  className = '',
}: RatingDistributionProps) => {
  // Tổng số lượng đánh giá (dùng để tính phần trăm)
  const total = useMemo(() => {
    return ratings.reduce((sum, r) => sum + r.count, 0);
  }, [ratings]);

  // Sắp xếp theo sao giảm dần (5 sao -> 4 sao -> ...)
  const sortedRatings = useMemo(() => {
    return [...ratings].sort((a, b) => b.stars - a.stars);
  }, [ratings]);

  return (
    <div className={`space-y-2 ${className}`}>
      {sortedRatings.map((rating) => (
        <RatingBar
          key={rating.stars}
          stars={rating.stars}
          count={rating.count}
          total={total}
          maxStars={maxStars}
          barColor={barColor}
          backgroundColor={backgroundColor}
          height={height}
          showPercentage={showPercentage}
        />
      ))}
    </div>
  );
};

export default RatingDistribution;
