// import { AdminHeader } from '@/components/admin/admin-header';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Building2, Palette, MessageSquare, Mail, CreditCard, Bell, Cog } from 'lucide-react';

// interface SettingsLayoutProps {
//   children: React.ReactNode;
//   title: string;
//   description: string;
// }

// export default function SettingsLayout({ children, title, description }: SettingsLayoutProps) {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
//       <AdminHeader title={title} description={description} />

//       <div className="p-6 ">
//         <div className="max-w-full mx-auto">
//           <Tabs defaultValue="general" className="space-y-8">
//             <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm">
//               <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto p-1 bg-slate-100 rounded-xl">
//                 <TabsTrigger value="general" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
//                   <Building2 className="h-4 w-4 text-blue-600" />
//                   <span>General</span>
//                 </TabsTrigger>
//                 <TabsTrigger value="branding" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
//                   <Palette className="h-4 w-4 text-purple-600" />
//                   <span>Branding</span>
//                 </TabsTrigger>
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
//                 <TabsTrigger value="notifications" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
//                   <Bell className="h-4 w-4 text-orange-600" />
//                   <span>Alerts</span>
//                 </TabsTrigger>
//                 <TabsTrigger value="advanced" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
//                   <Cog className="h-4 w-4 text-slate-600" />
//                   <span>Advanced</span>
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

import { AdminHeader } from '@/components/admin/admin-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Palette, Bell, Cog } from 'lucide-react';

interface SettingsLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export default function SettingsLayout({ children, title, description }: SettingsLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 ">
      {/* <AdminHeader title={title} description={description} /> */}

      <div className="p-6 px-0 md:px-0 -mt-8">
        <div className="max-w-full mx-auto px-0 md:px-0">
          <Tabs defaultValue="general" className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm">
              <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-slate-100 rounded-xl">
                <TabsTrigger value="general" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span>General</span>
                </TabsTrigger>
                <TabsTrigger value="branding" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                  <Palette className="h-4 w-4 text-purple-600" />
                  <span>Branding</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                  <Bell className="h-4 w-4 text-orange-600" />
                  <span>Alerts</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                  <Cog className="h-4 w-4 text-slate-600" />
                  <span>Advanced</span>
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