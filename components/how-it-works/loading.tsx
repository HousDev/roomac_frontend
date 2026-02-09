export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white">
      {/* Hero Section Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#9aa5b1] via-blue-100 to-white py-24 animate-pulse">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge Skeleton */}
            <div className="mb-6">
              <div className="inline-block h-8 w-48 bg-gray-300 rounded-full"></div>
            </div>
            
            {/* Heading Skeleton */}
            <div className="h-12 bg-gray-300 rounded-lg mb-6 mx-auto max-w-2xl"></div>
            
            {/* Paragraph Skeleton */}
            <div className="h-6 bg-gray-300 rounded-lg mb-8 mx-auto max-w-3xl"></div>
            <div className="h-6 bg-gray-300 rounded-lg mb-8 mx-auto max-w-2xl"></div>
            
            {/* Buttons Skeleton */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="h-12 w-48 bg-gray-300 rounded-lg"></div>
              <div className="h-12 w-48 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Skeleton */}
      <section className="py-12 -mt-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border-0 shadow-xl bg-white rounded-xl p-6">
                <div className="h-16 w-16 mx-auto mb-4 bg-gray-300 rounded-3xl"></div>
                <div className="h-10 bg-gray-300 rounded-lg mb-2"></div>
                <div className="h-4 bg-gray-300 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section Skeleton */}
      <section className="py-20 -mt-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block h-6 w-32 bg-gray-300 rounded-full mb-4"></div>
              <div className="h-10 bg-gray-300 rounded-lg mb-4 mx-auto max-w-md"></div>
              <div className="h-6 bg-gray-300 rounded-lg mx-auto max-w-2xl"></div>
            </div>

            <div className="space-y-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border-0 shadow-2xl bg-white rounded-xl overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-2/5 bg-gray-300 p-12"></div>
                    <div className="md:w-3/5 p-8 md:p-12">
                      <div className="h-8 bg-gray-300 rounded-lg mb-4 w-3/4"></div>
                      <div className="space-y-3 mb-6">
                        <div className="h-4 bg-gray-300 rounded-lg"></div>
                        <div className="h-4 bg-gray-300 rounded-lg"></div>
                        <div className="h-4 bg-gray-300 rounded-lg w-5/6"></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((j) => (
                          <div key={j} className="h-10 bg-gray-200 rounded-lg"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}