export default function RootLoading() {
  return (
    <div className="flex flex-col overflow-hidden min-h-screen">
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-200 to-blue-50 animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>
  );
}
