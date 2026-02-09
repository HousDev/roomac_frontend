export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-0 shadow-lg bg-white rounded-lg animate-pulse">
              <div className="p-6">
                <div className="h-12 w-12 rounded-xl bg-gray-200 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="border-0 shadow-lg bg-white rounded-lg animate-pulse">
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="h-40 w-40 mx-auto rounded-full bg-gray-200 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2 border-0 shadow-lg bg-white rounded-lg animate-pulse">
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="h-52 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}