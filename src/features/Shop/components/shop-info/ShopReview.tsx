import React, { useEffect, useState } from "react";
import Section from "@/foundation/components/sections/Section";
import Loading from "@/foundation/components/loading/Loading";
import Empty from "@/foundation/components/empty/Empty";
import { shopManagementApi } from "@/core/api/shop-management";
import { Star, User } from "lucide-react";

interface Review {
  _id: string;
  userId: string | {
    _id: string;
    name: string;
    avatar?: string;
  };
  user?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
}

interface ReviewsData {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const ShopReview: React.FC = () => {
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const response = await shopManagementApi.getReviews({
          page: currentPage,
          limit: 10,
        });
        if (response.data) {
          const data = response.data as ReviewsData;
          
          // Tính toán lại từ reviews nếu backend trả về sai
          const reviews = data.reviews || [];
          let calculatedAverageRating = data.averageRating;
          let calculatedTotalReviews = data.totalReviews;
          let calculatedRatingDistribution = data.ratingDistribution;
          
          // Nếu có reviews nhưng averageRating hoặc totalReviews = 0, tính toán lại
          if (reviews.length > 0 && (calculatedAverageRating === 0 || calculatedTotalReviews === 0)) {
            const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
            calculatedAverageRating = totalRating / reviews.length;
            calculatedTotalReviews = reviews.length;
            
            // Tính rating distribution
            calculatedRatingDistribution = {};
            reviews.forEach((review) => {
              const rating = review.rating || 0;
              if (rating >= 1 && rating <= 5) {
                calculatedRatingDistribution[rating] = (calculatedRatingDistribution[rating] || 0) + 1;
              }
            });
          }
          
          setReviewsData({
            ...data,
            averageRating: calculatedAverageRating,
            totalReviews: calculatedTotalReviews,
            ratingDistribution: calculatedRatingDistribution,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải đánh giá");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [currentPage]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <Star
        key={idx}
        className={`w-4 h-4 ${
          idx < rating ? "fill-warning text-warning" : "text-neutral-4"
        }`}
      />
    ));
  };

  if (isLoading) {
    return <Loading layout="centered" message="Đang tải đánh giá..." />;
  }

  if (error) {
    return <Empty variant="default" title="Lỗi tải dữ liệu" description={error} />;
  }

  if (!reviewsData) {
    return <Empty variant="data" title="Chưa có đánh giá" description="Chưa có đánh giá nào" />;
  }

  return (
    <div>
        <div className="flex gap-4 items-center mb-6">
          <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-primary-6">
            <Star className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-9">Đánh giá cửa hàng</h1>
            <p className="text-sm text-neutral-6">Xem và quản lý đánh giá từ khách hàng</p>
          </div>
        </div>

        <Section>
          <div className="flex gap-6 items-center p-6 mb-6 bg-background-1 rounded-lg border border-border-1">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-6 mb-1">
                {reviewsData.averageRating.toFixed(1)}
              </div>
              <div className="flex gap-1 justify-center mb-2">
                {renderStars(Math.round(reviewsData.averageRating))}
              </div>
              <p className="text-sm text-neutral-6">
                {reviewsData.totalReviews} đánh giá
              </p>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviewsData.ratingDistribution[rating] || 0;
                const percentage = reviewsData.totalReviews > 0
                  ? (count / reviewsData.totalReviews) * 100
                  : 0;
                return (
                  <div key={rating} className="flex gap-2 items-center">
                    <span className="text-sm text-neutral-7 w-8">{rating} sao</span>
                    <div className="flex-1 h-2 bg-neutral-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-warning transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-neutral-6 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {reviewsData.reviews.length === 0 ? (
              <Empty variant="data" title="Chưa có đánh giá" description="Chưa có đánh giá nào" />
            ) : (
              reviewsData.reviews.map((review) => {
                // Xử lý userId: có thể là string hoặc object
                const userInfo = typeof review.userId === "object" 
                  ? review.userId 
                  : review.user || null;
                const userName = userInfo?.name || "Khách hàng";
                const userAvatar = userInfo?.avatar;
                
                return (
                  <div
                    key={review._id}
                    className="p-4 bg-background-1 rounded-lg border border-border-1"
                  >
                    <div className="flex gap-4 items-start">
                      <div className="flex justify-center items-center w-10 h-10 rounded-full bg-primary-6 text-white">
                        {userAvatar ? (
                          <img
                            src={userAvatar}
                            alt={userName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex gap-2 items-center mb-2">
                          <span className="font-semibold text-neutral-9">
                            {userName}
                          </span>
                          <div className="flex gap-1">{renderStars(review.rating)}</div>
                          <span className="text-xs text-neutral-6 ml-auto">
                            {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-neutral-7">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {reviewsData.pagination && reviewsData.pagination.totalPages > 1 && (
            <div className="flex gap-2 justify-center items-center mt-6">
              <button
                className="px-4 py-2 text-sm font-medium text-primary-6 bg-background-1 border border-border-1 rounded-lg hover:bg-background-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Trước
              </button>
              <span className="text-sm text-neutral-7">
                Trang {currentPage} / {reviewsData.pagination.totalPages}
              </span>
              <button
                className="px-4 py-2 text-sm font-medium text-primary-6 bg-background-1 border border-border-1 rounded-lg hover:bg-background-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === reviewsData.pagination.totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Sau
              </button>
            </div>
          )}
        </Section>
    </div>
  );
};

export default ShopReview;

