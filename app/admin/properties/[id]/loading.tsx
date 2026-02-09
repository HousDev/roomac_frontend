// app/admin/properties/[id]/loading.tsx
export default function PropertyDetailsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full" />
        <p className="text-slate-600">Loading property details...</p>
      </div>
    </div>
  );
}