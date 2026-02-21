// // import { AdminHeader } from '@/components/admin/admin-header';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { MessageSquare, Mail, CreditCard } from 'lucide-react';

// interface IntegrationLayoutProps {
//   children: React.ReactNode;
//   title: string;
//   description: string;
// }

// export default function IntegrationLayout({ children, title, description }: IntegrationLayoutProps) {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
//       {/* <AdminHeader title={title} description={description} /> */}

//       <div className="p-6 px-0 md:px-0">
//         <div className="max-w-full mx-auto -mt-7 ">
//           <Tabs defaultValue="sms" className="space-y-8">
//             <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm ">
//               <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-slate-100 rounded-xl">
//                 <TabsTrigger value="sms" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
//                   <MessageSquare className="h-4 w-4 text-green-600" />
//                   <span>SMS</span>
//                 </TabsTrigger>
//                 <TabsTrigger value="email" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
//                   <Mail className="h-4 w-4 text-blue-600" />
//                   <span>Email</span>
//                 </TabsTrigger>
//                 <TabsTrigger value="payment" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
//                   <CreditCard className="h-4 w-4 text-emerald-600" />
//                   <span>Payment</span>
//                 </TabsTrigger>
//               </TabsList>
//             </div>
//             {children}
//           </Tabs>
//         </div>
//       </div>
//     </div>
//   );
// }

// import { AdminHeader } from '@/components/admin/admin-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Mail, CreditCard, LayoutGrid } from 'lucide-react';

interface IntegrationLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export default function IntegrationLayout({ children, title, description }: IntegrationLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* <AdminHeader title={title} description={description} /> */}

      <div className="p-6 px-0 md:px-0">
        <div className="max-w-full mx-auto -mt-7">
          <Tabs defaultValue="all" className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm">
              <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-slate-100 rounded-xl">
                {/* ── NEW: All tab ── */}
                <TabsTrigger value="all" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                  <LayoutGrid className="h-4 w-4 text-slate-600" />
                  <span>All</span>
                </TabsTrigger>
                <TabsTrigger value="sms" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  <span>SMS</span>
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>Email</span>
                </TabsTrigger>
                <TabsTrigger value="payment" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span>Payment</span>
                </TabsTrigger>
              </TabsList>
            </div>
            {children}
          </Tabs>
        </div>
      </div>
    </div>
  );
}