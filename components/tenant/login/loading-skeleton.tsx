export default function LoadingSkeleton() {
  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Left side skeleton */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-100 to-blue-200 animate-pulse"></div>
      
      {/* Right side skeleton */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
          </div>
          
          <div className="bg-white rounded-2xl p-7 border border-gray-200 shadow-lg">
            <div className="space-y-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-11 bg-gray-200 rounded-full"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-11 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}