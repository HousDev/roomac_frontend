import { AdminHeader } from '@/components/admin/admin-header';
import { Card, CardContent } from '@/components/ui/card';

export default function LoadingSkeleton() {
  return (
    <div className=" bg-gradient-to-b from-slate-50 to-slate-100 overflow-auto">
      <AdminHeader title="Settings" description="Manage your platform configuration" />
      <div className="p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto overflow-scroll">
          <Card className="border-0 shadow-xl">
            <CardContent className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004AAD] mx-auto mb-4"></div>
                <p className="text-slate-600">Loading settings...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}