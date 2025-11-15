import React from "react";
import { Star, ThumbsUp, User } from "lucide-react";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import { ProductReview } from "@/core/api/products/type";
import Button from "@/foundation/components/buttons/Button";
import Empty from "@/foundation/components/empty/Empty";

interface ReviewProductProps {
  reviews: ProductReview[];
  averageRating?: number;
  totalReviews?: number;
  ratingDistribution?: Record<string, number>;
}

const ReviewProduct: React.FC<ReviewProductProps> = ({
  reviews,
  averageRating,
  totalReviews,
  ratingDistribution,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!reviews || reviews.length === 0) {
    return (
      <Section>
        <SectionTitle>Đánh giá sản phẩm</SectionTitle>
        <Empty
          variant="default"
          title="Chưa có đánh giá"
          description="Hãy là người đầu tiên đánh giá sản phẩm này"
        />
      </Section>
    );
  }

  return (
    <Section className="bg-background-2 rounded-2xl p-6 lg:p-8 shadow-sm border border-border-1">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex justify-center items-center w-10 h-10 rounded-lg bg-primary-6/10">
          <Star className="w-5 h-5 text-primary-6 fill-primary-6" />
        </div>
        <SectionTitle className="!mb-0">Đánh giá sản phẩm ({totalReviews || 0})</SectionTitle>
      </div>

      {/* Rating Summary */}
      {averageRating !== undefined && totalReviews !== undefined && (
        <div className="mb-8 p-6 bg-gradient-to-r from-primary-6/10 to-primary-6/5 rounded-xl border border-primary-6/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-primary-6">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-lg text-neutral-6">/5</span>
              </div>
              <div className="flex gap-1 items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(averageRating) ? "fill-warning text-warning" : "text-neutral-3"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-neutral-6">Dựa trên {totalReviews} đánh giá</p>
            </div>

            {/* Rating Distribution */}
            {ratingDistribution && (
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingDistribution[rating.toString()] || 0;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={rating} className="flex gap-2 items-center">
                      <div className="flex gap-1 items-center w-16">
                        <span className="text-sm text-neutral-7">{rating}</span>
                        <Star className="w-3 h-3 fill-warning text-warning" />
                      </div>
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
            )}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="p-5 bg-background-1 rounded-xl border border-border-1 hover:shadow-md transition-all duration-200"
          >
            <div className="flex gap-4 items-start">
              {/* User Avatar */}
              <div className="flex-shrink-0">
                {review.user?.avatar ? (
                  <img
                    src={review.user.avatar}
                    alt={review.user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-border-1"
                  />
                ) : (
                  <div className="flex justify-center items-center w-12 h-12 rounded-full bg-primary-6/10 border-2 border-border-1">
                    <User className="w-6 h-6 text-primary-6" />
                  </div>
                )}
              </div>

              {/* Review Content */}
              <div className="flex-1">
                <div className="flex gap-2 items-center mb-2">
                  <h4 className="font-semibold text-neutral-9">
                    {review.user?.name || "Người dùng"}
                  </h4>
                  {review.isVerified && (
                    <span className="px-2 py-0.5 text-xs font-medium text-success bg-success/10 rounded-md">
                      Đã mua hàng
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex gap-1 items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? "fill-warning text-warning" : "text-neutral-3"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-xs text-neutral-6">
                    {formatDate(review.createdAt)}
                  </span>
                </div>

                {/* Review Title */}
                {review.title && (
                  <h5 className="mb-2 font-medium text-neutral-9">{review.title}</h5>
                )}

                {/* Review Comment */}
                {review.comment && (
                  <p className="mb-3 text-sm text-neutral-7 leading-relaxed">{review.comment}</p>
                )}

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {review.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Review image ${index + 1}`}
                        className="w-24 h-24 rounded-lg object-cover border-2 border-border-1 hover:border-primary-3 transition-colors cursor-pointer"
                      />
                    ))}
                  </div>
                )}

                {/* Helpful Count */}
                <div className="flex gap-4 items-center">
                  <button className="flex gap-1 items-center text-xs text-neutral-6 hover:text-primary-6 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Hữu ích ({review.helpfulCount || 0})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {reviews.length >= 10 && (
        <div className="flex justify-center mt-6">
          <Button color="blue" variant="outline" size="md">
            Xem thêm đánh giá
          </Button>
        </div>
      )}
    </Section>
  );
};

export default ReviewProduct;
