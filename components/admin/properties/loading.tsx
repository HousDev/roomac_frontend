import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertiesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4">
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-xl overflow-hidden rounded-2xl">
        {/* Header Skeleton */}
        <div className="sticky top-0 z-30 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-500">
          <div className="py-2 px-3">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-[420px] rounded-lg" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-28 rounded-lg" />
                  <Skeleton className="h-8 w-32 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-h-[calc(100vh-160px)] overflow-y-auto">
          <CardContent className="p-5">
            {/* Tabs Skeleton */}
            <div className="mb-6">
              <div className="flex space-x-2">
                <Skeleton className="h-10 w-32 rounded-lg" />
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
            </div>

            {/* Filters Skeleton */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
            </div>

            {/* Properties Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="h-80 animate-pulse">
                  <div className="h-40 bg-gray-200" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="grid grid-cols-3 gap-1">
                      <Skeleton className="h-8 rounded" />
                      <Skeleton className="h-8 rounded" />
                      <Skeleton className="h-8 rounded" />
                    </div>
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}