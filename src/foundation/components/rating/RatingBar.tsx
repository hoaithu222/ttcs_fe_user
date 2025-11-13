import { useMemo } from 'react';

/**
 * Component hiển thị thanh rating (ví dụ: 5 sao - █████ 80%)
 */
type Props = {
  /** Số sao (ví dụ: 5, 4, 3...) */
  stars: number;

  /** Số lượng đánh giá có mức sao này */
  count: number;

  /** Tổng số đánh giá của tất cả các mức sao (để tính phần trăm) */
  total: number;

  /** Số sao tối đa (mặc định là 5) */
  maxStars?: number;

  /** Màu thanh chính (phần đã tô) — mặc định là vàng (#FFC107) */
  barColor?: string;

  /** Màu nền thanh (phần chưa tô) — mặc định là xám nhạt (#E5E7EB) */
  backgroundColor?: string;

  /** Chiều cao của thanh bar (px) — mặc định là 8 */
  height?: number;

  /** Hiển thị phần trăm (%) thay vì số lượng đánh giá — mặc định false */
  showPercentage?: boolean;

  /** Thêm class tùy chỉnh từ ngoài vào (ví dụ: margin-top, padding...) */
  className?: string;
};

const RatingBar = ({
  stars,
  count,
  total,
  maxStars = 5,
  barColor = '#FFC107',
  backgroundColor = '#E5E7EB',
  height = 8,
  showPercentage = false,
  className = '',
}: Props) => {
  // Tính phần trăm số lượng đánh giá của mức sao này
  const percentage = useMemo(() => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  }, [count, total]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Số sao (ví dụ: "5 sao") */}
      <span className="min-w-[48px] text-sm font-medium text-slate-700">{stars} sao</span>

      {/* Thanh tỷ lệ hiển thị phần trăm */}
      <div
        className="flex-1 overflow-hidden rounded-full"
        style={{
          backgroundColor,
          height: `${height}px`,
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor,
          }}
        />
      </div>

      {/* Hiển thị phần trăm hoặc số lượng đánh giá */}
      <span className="min-w-[32px] text-right text-sm font-semibold text-slate-800">
        {showPercentage ? `${percentage}%` : count}
      </span>
    </div>
  );
};

export default RatingBar;
