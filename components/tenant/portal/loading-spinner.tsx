export default function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-6 text-slate-700 font-medium">{message}</p>
        <p className="text-sm text-slate-500 mt-2">Please wait while we prepare everything</p>
      </div>
    </div>
  );
}