export function AddOnsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16 bg-white border-b"></div>
      <div className="p-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="h-10 w-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border animate-pulse">
          <div className="p-4 border-b">
            <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="p-6">
            <div className="h-96 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}