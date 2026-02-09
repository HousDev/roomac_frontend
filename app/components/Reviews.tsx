import { Star, ThumbsUp, MessageSquare, User, CheckCircle2 } from 'lucide-react';

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
  roomType: string;
  stayDuration: string;
  verified: boolean;
  helpful: number;
}

interface ReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export function Reviews({ reviews, averageRating, totalReviews }: ReviewsProps) {
  const ratingDistribution = [
    { stars: 5, count: 42, percentage: 70 },
    { stars: 4, count: 12, percentage: 20 },
    { stars: 3, count: 4, percentage: 7 },
    { stars: 2, count: 2, percentage: 3 },
    { stars: 1, count: 0, percentage: 0 },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="glass rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-600 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
              Guest Reviews
            </h2>
            <p className="text-sm text-gray-600 font-semibold">
              Based on {totalReviews} verified reviews
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[300px,1fr] gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-6 border-2 border-blue-100">
          <div className="text-center mb-4">
            <div className="text-5xl font-black bg-blue-800  bg-clip-text text-transparent mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= averageRating
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-700 font-bold">Excellent</p>
            <p className="text-xs text-gray-600 font-semibold">{totalReviews} reviews</p>
          </div>

          <div className="space-y-2">
            {ratingDistribution.map((dist) => (
              <div key={dist.stars} className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-700 w-8">{dist.stars} ★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-600"
                    style={{ width: `${dist.percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold text-gray-600 w-8">{dist.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-blue-200 transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="relative flex-shrink-0">
                  <img
                    src={review.userAvatar}
                    alt={review.userName}
                    className="w-12 h-12 rounded-lg object-cover ring-2 ring-gray-200"
                  />
                  {review.verified && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="font-black text-gray-900 text-sm">{review.userName}</p>
                      <p className="text-xs text-gray-600 font-semibold">
                        {review.roomType} • Stayed {review.stayDuration}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-black text-blue-600">{review.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-700 font-semibold leading-relaxed mb-3">
                {review.comment}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500 font-semibold">{formatDate(review.date)}</span>
                <button className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 font-bold transition-colors">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  Helpful ({review.helpful})
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all">
          Load More Reviews
        </button>
      </div>
    </div>
  );
}
