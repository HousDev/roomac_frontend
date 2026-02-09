// app/admin/properties/loading.tsx - Loading State
export default function PropertiesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 animate-pulse">
      <div className="p-4">
        <div className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-xl overflow-hidden rounded-2xl">
          <div className="h-20 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-500" />
          <div className="p-5">
            <div className="h-10 bg-gray-200 rounded mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}