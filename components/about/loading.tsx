export default function AboutLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white">
      {/* Hero Skeleton */}
      <div className="h-96 bg-gradient-to-br from-blue-200 via-[#cfdbea] to-blue-100 animate-pulse" />
      
      {/* Stats Skeleton */}
      <div className="container mx-auto px-4 py-12 -mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-white rounded-xl shadow animate-pulse" />
          ))}
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-20 space-y-20">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="max-w-5xl mx-auto">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-8 mx-auto" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}