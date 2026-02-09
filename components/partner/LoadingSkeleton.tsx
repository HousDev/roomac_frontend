export function LoadingSkeleton() {
  return (
    <div className="flex-1 animate-pulse">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-blue-200 to-slate-100 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="h-12 bg-slate-300 rounded mb-6 w-3/4 mx-auto"></div>
            <div className="h-6 bg-slate-300 rounded mb-8 w-1/2 mx-auto"></div>
            <div className="flex justify-center gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-24 bg-slate-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Benefits skeleton */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="h-10 bg-slate-300 rounded mb-12 w-64 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* How it works skeleton */}
      <div className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="h-10 bg-slate-300 rounded mb-12 w-48 mx-auto"></div>
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 bg-slate-300 rounded-full mb-4 mx-auto"></div>
                  <div className="h-4 bg-slate-300 rounded mb-2 w-24 mx-auto"></div>
                  <div className="h-3 bg-slate-300 rounded w-32 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Form skeleton */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="h-10 bg-slate-300 rounded mb-4 w-48 mx-auto"></div>
            <div className="h-6 bg-slate-300 rounded mb-8 w-64 mx-auto"></div>
            <div className="h-96 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
      
      {/* Footer skeleton */}
      <div className="py-16 bg-blue-900">
        <div className="container mx-auto px-4 text-center">
          <div className="h-8 bg-blue-800 rounded mb-4 w-48 mx-auto"></div>
          <div className="h-4 bg-blue-800 rounded w-96 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}