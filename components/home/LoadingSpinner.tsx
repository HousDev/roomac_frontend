// components/ui/LoadingSpinner.tsx
export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      <span className="ml-3 text-slate-600">Loading...</span>
    </div>
  );
}