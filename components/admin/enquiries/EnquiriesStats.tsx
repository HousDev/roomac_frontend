// // components/admin/enquiries/components/EnquiriesStats.tsx
// import { Card, CardContent } from "@/components/ui/card";
// import { BarChart3 } from "lucide-react";

// interface EnquiriesStatsProps {
//   stats: {
//     total: number;
//     new_count: number;
//     contacted_count: number;
//     interested_count: number;
//     converted_count: number;
//     closed_count: number;
//     [key: string]: number;
//   };
// }

// const EnquiriesStats = ({ stats }: EnquiriesStatsProps) => {
//   if (!stats) return null;

//   // Calculate conversion rate
//   const conversionRate = stats.total > 0 
//     ? ((stats.converted_count / stats.total) * 100).toFixed(1)
//     : "0.0";

//   // Calculate follow-up rate (interested + contacted vs total)
// const followedUpCount = Math.max(
//   stats.contacted_count,
//   stats.interested_count
// );

// const followupRate = stats.total > 0
//   ? ((followedUpCount / stats.total) * 100).toFixed(1)
//   : "0.0";


//   return (
//     <div className="space-y-4 mb-6">
//       {/* Summary Cards */}
//       <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
//         <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-sm font-medium text-blue-700">Total</p>
//               <div className="bg-blue-100 p-1 rounded">
//                 <BarChart3 className="h-3 w-3 text-blue-600" />
//               </div>
//             </div>
//             <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
//             <p className="text-xs text-blue-600 mt-1">All enquiries</p>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-sm font-medium text-yellow-700">New</p>
//               <div className="bg-yellow-100 p-1 rounded">
//                 <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
//               </div>
//             </div>
//             <p className="text-2xl font-bold text-yellow-800">{stats.new_count}</p>
//             <p className="text-xs text-yellow-600 mt-1">
//               {stats.total > 0 ? `${((stats.new_count / stats.total) * 100).toFixed(0)}% of total` : "No enquiries"}
//             </p>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-sm font-medium text-orange-700">Contacted</p>
//               <div className="bg-orange-100 p-1 rounded">
//                 <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
//               </div>
//             </div>
//             <p className="text-2xl font-bold text-orange-800">{stats.contacted_count}</p>
//             <p className="text-xs text-orange-600 mt-1">
//               {stats.total > 0 ? `${((stats.contacted_count / stats.total) * 100).toFixed(0)}% of total` : "No enquiries"}
//             </p>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-sm font-medium text-green-700">Interested</p>
//               <div className="bg-green-100 p-1 rounded">
//                 <div className="h-3 w-3 bg-green-500 rounded-full"></div>
//               </div>
//             </div>
//             <p className="text-2xl font-bold text-green-800">{stats.interested_count}</p>
//             <p className="text-xs text-green-600 mt-1">
//               {stats.total > 0 ? `${((stats.interested_count / stats.total) * 100).toFixed(0)}% of total` : "No enquiries"}
//             </p>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-sm font-medium text-purple-700">Converted</p>
//               <div className="bg-purple-100 p-1 rounded">
//                 <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
//               </div>
//             </div>
//             <p className="text-2xl font-bold text-purple-800">{stats.converted_count}</p>
//             <p className="text-xs text-purple-600 mt-1">
//               {stats.total > 0 ? `${((stats.converted_count / stats.total) * 100).toFixed(0)}% of total` : "No enquiries"}
//             </p>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-sm font-medium text-gray-700">Closed</p>
//               <div className="bg-gray-100 p-1 rounded">
//                 <div className="h-3 w-3 bg-gray-500 rounded-full"></div>
//               </div>
//             </div>
//             <p className="text-2xl font-bold text-gray-800">{stats.closed_count}</p>
//             <p className="text-xs text-gray-600 mt-1">
//               {stats.total > 0 ? `${((stats.closed_count / stats.total) * 100).toFixed(0)}% of total` : "No enquiries"}
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Performance Metrics */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <Card className="border border-blue-200">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between mb-2">
//               <div>
//                 <p className="text-sm font-medium text-gray-700">Conversion Rate</p>
//                 <p className="text-xs text-gray-500">Converted vs Total</p>
//               </div>
//               <div className="bg-blue-50 p-2 rounded-lg">
//                 <BarChart3 className="h-4 w-4 text-blue-600" />
//               </div>
//             </div>
//             <div className="flex items-baseline gap-1">
//               <p className="text-2xl font-bold text-blue-700">{conversionRate}%</p>
//               <p className="text-xs text-gray-500">
//                 ({stats.converted_count} of {stats.total})
//               </p>
//             </div>
//             <div className="mt-2">
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div 
//                   className="bg-blue-600 h-2 rounded-full" 
//                   style={{ width: `${conversionRate}%` }}
//                 ></div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="border border-green-200">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between mb-2">
//               <div>
//                 <p className="text-sm font-medium text-gray-700">Follow-up Rate</p>
//                 <p className="text-xs text-gray-500">Contacted & Interested</p>
//               </div>
//               <div className="bg-green-50 p-2 rounded-lg">
//                 <BarChart3 className="h-4 w-4 text-green-600" />
//               </div>
//             </div>
//             <div className="flex items-baseline gap-1">
//               <p className="text-2xl font-bold text-green-700">{followupRate}%</p>
//               <p className="text-xs text-gray-500">
//                 ({followedUpCount} of {stats.total})
//               </p>
//             </div>
//             <div className="mt-2">
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div 
//                   className="bg-green-600 h-2 rounded-full" 
//                   style={{ width: `${followupRate}%` }}
//                 ></div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="border border-purple-200">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between mb-2">
//               <div>
//                 <p className="text-sm font-medium text-gray-700">Active Pipeline</p>
//                 <p className="text-xs text-gray-500">New + Contacted + Interested</p>
//               </div>
//               <div className="bg-purple-50 p-2 rounded-lg">
//                 <BarChart3 className="h-4 w-4 text-purple-600" />
//               </div>
//             </div>
//             <div className="flex items-baseline gap-1">
//               <p className="text-2xl font-bold text-purple-700">
//                 {stats.new_count + stats.contacted_count + stats.interested_count}
//               </p>
//               <p className="text-xs text-gray-500">
//                 of {stats.total} total
//               </p>
//             </div>
//             <div className="flex items-center gap-2 mt-2 text-xs">
//               <div className="flex items-center gap-1">
//                 <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
//                 <span>New: {stats.new_count}</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
//                 <span>Contacted: {stats.contacted_count}</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <div className="h-2 w-2 bg-green-500 rounded-full"></div>
//                 <span>Interested: {stats.interested_count}</span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default EnquiriesStats;


// components/admin/enquiries/components/EnquiriesStats.tsx
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Star, Phone, Heart, TrendingUp, XCircle, BarChart2 } from "lucide-react";

interface EnquiriesStatsProps {
  stats: {
    total: number;
    new_count: number;
    contacted_count: number;
    interested_count: number;
    converted_count: number;
    closed_count: number;
    [key: string]: number;
  };
}

const EnquiriesStats = ({ stats }: EnquiriesStatsProps) => {
  if (!stats) return null;

  // Calculate conversion rate
  const conversionRate = stats.total > 0 
    ? ((stats.converted_count / stats.total) * 100).toFixed(1)
    : "0.0";

  // Calculate follow-up rate (interested + contacted vs total)
  const followedUpCount = Math.max(
    stats.contacted_count,
    stats.interested_count
  );

  const followupRate = stats.total > 0
    ? ((followedUpCount / stats.total) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-1.5 mb-2 -mt-3">

      {/* ── Top 6 status cards ──────────────────────────────────────────
          Mobile  : 3 cols × 2 rows  (grid-cols-3)
          Desktop : 6 cols × 1 row   (md:grid-cols-6)
      ────────────────────────────────────────────────────────────────── */}
 <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">

  {/* Total */}
  <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-2 py-0.5 md:px-3 md:py-2 min-h-[48px] md:min-h-0">
    <div className="leading-none">
      <p className="text-[8px] md:text-[10px] font-medium text-blue-600">
        Total
      </p>
      <p className="text-[11px] md:text-sm font-bold text-blue-800">
        {stats.total}
      </p>
      <p className="text-[7px] md:text-[9px] text-blue-400">
        All enquiries
      </p>
    </div>
    <div className="h-6 w-6 md:h-7 md:w-7 rounded-full bg-blue-500 flex items-center justify-center">
      <BarChart3 className="h-3 w-3 md:h-3.5 md:w-3.5 text-white" />
    </div>
  </div>

  {/* New */}
  <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-lg px-2 py-0.5 md:px-3 md:py-2 min-h-[48px] md:min-h-0">
    <div className="leading-none">
      <p className="text-[8px] md:text-[10px] font-medium text-amber-600">
        New
      </p>
      <p className="text-[11px] md:text-sm font-bold text-amber-800">
        {stats.new_count}
      </p>
      <p className="text-[7px] md:text-[9px] text-amber-400">
        {stats.total > 0
          ? `${((stats.new_count / stats.total) * 100).toFixed(0)}% of total`
          : "No enquiries"}
      </p>
    </div>
    <div className="h-6 w-6 md:h-7 md:w-7 rounded-full bg-amber-400 flex items-center justify-center">
      <Star className="h-3 w-3 md:h-3.5 md:w-3.5 text-white" />
    </div>
  </div>

  {/* Contacted */}
  <div className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-lg px-2 py-0.5 md:px-3 md:py-2 min-h-[48px] md:min-h-0">
    <div className="leading-none">
      <p className="text-[8px] md:text-[10px] font-medium text-orange-600">
        Contacted
      </p>
      <p className="text-[11px] md:text-sm font-bold text-orange-800">
        {stats.contacted_count}
      </p>
      <p className="text-[7px] md:text-[9px] text-orange-400">
        {stats.total > 0
          ? `${((stats.contacted_count / stats.total) * 100).toFixed(0)}% of total`
          : "No enquiries"}
      </p>
    </div>
    <div className="h-6 w-6 md:h-7 md:w-7 rounded-full bg-orange-400 flex items-center justify-center">
      <Phone className="h-3 w-3 md:h-3.5 md:w-3.5 text-white" />
    </div>
  </div>

  {/* Interested */}
  <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg px-2 py-0.5 md:px-3 md:py-2 min-h-[48px] md:min-h-0">
    <div className="leading-none">
      <p className="text-[8px] md:text-[10px] font-medium text-green-600">
        Interested
      </p>
      <p className="text-[11px] md:text-sm font-bold text-green-800">
        {stats.interested_count}
      </p>
      <p className="text-[7px] md:text-[9px] text-green-400">
        {stats.total > 0
          ? `${((stats.interested_count / stats.total) * 100).toFixed(0)}% of total`
          : "No enquiries"}
      </p>
    </div>
    <div className="h-6 w-6 md:h-7 md:w-7 rounded-full bg-green-500 flex items-center justify-center">
      <Heart className="h-3 w-3 md:h-3.5 md:w-3.5 text-white" />
    </div>
  </div>

  {/* Converted */}
  <div className="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-lg px-2 py-0.5 md:px-3 md:py-2 min-h-[48px] md:min-h-0">
    <div className="leading-none">
      <p className="text-[8px] md:text-[10px] font-medium text-purple-600">
        Converted
      </p>
      <p className="text-[11px] md:text-sm font-bold text-purple-800">
        {stats.converted_count}
      </p>
      <p className="text-[7px] md:text-[9px] text-purple-400">
        {stats.total > 0
          ? `${((stats.converted_count / stats.total) * 100).toFixed(0)}% of total`
          : "No enquiries"}
      </p>
    </div>
    <div className="h-6 w-6 md:h-7 md:w-7 rounded-full bg-purple-500 flex items-center justify-center">
      <TrendingUp className="h-3 w-3 md:h-3.5 md:w-3.5 text-white" />
    </div>
  </div>

  {/* Closed */}
  <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-2 py-0.5 md:px-3 md:py-2 min-h-[48px] md:min-h-0">
    <div className="leading-none">
      <p className="text-[8px] md:text-[10px] font-medium text-gray-500">
        Closed
      </p>
      <p className="text-[11px] md:text-sm font-bold text-gray-700">
        {stats.closed_count}
      </p>
      <p className="text-[7px] md:text-[9px] text-gray-400">
        {stats.total > 0
          ? `${((stats.closed_count / stats.total) * 100).toFixed(0)}% of total`
          : "No enquiries"}
      </p>
    </div>
    <div className="h-6 w-6 md:h-7 md:w-7 rounded-full bg-gray-400 flex items-center justify-center">
      <XCircle className="h-3 w-3 md:h-3.5 md:w-3.5 text-white" />
    </div>
  </div>

</div>




      {/* ── Bottom 3 metric cards ────────────────────────────────────────
          Mobile  : 1 col  (stacked)
          Desktop : 3 cols × 1 row
      ────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
  {/* Conversion Rate */}
  <div className="flex items-center justify-between bg-white border border-blue-100 rounded-lg px-2 md:px-3 py-2">
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline gap-1 mb-0.5">
        <p className="text-sm font-bold text-blue-700 leading-none">
          {conversionRate}%
        </p>
        <p className="text-[9px] text-gray-400 truncate">
          ({stats.converted_count} of {stats.total})
        </p>
      </div>

      <p className="text-[10px] font-medium text-gray-600">
        Conversion Rate
      </p>

      <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
        <div
          className="bg-blue-500 h-1 rounded-full"
          style={{ width: `${conversionRate}%` }}
        ></div>
      </div>
    </div>

    <div className="ml-2 md:ml-3 flex-shrink-0 h-6 w-6 md:h-7 md:w-7 rounded-full bg-blue-100 flex items-center justify-center">
      <TrendingUp className="h-3 w-3 md:h-3.5 md:w-3.5 text-blue-600" />
    </div>
  </div>

  {/* Follow-up Rate */}
  <div className="flex items-center justify-between bg-white border border-green-100 rounded-lg px-2 md:px-3 py-2">
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline gap-1 mb-0.5">
        <p className="text-sm font-bold text-green-700 leading-none">
          {followupRate}%
        </p>
        <p className="text-[9px] text-gray-400 truncate">
          ({followedUpCount} of {stats.total})
        </p>
      </div>

      <p className="text-[10px] font-medium text-gray-600">
        Follow-up Rate
      </p>

      <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
        <div
          className="bg-green-500 h-1 rounded-full"
          style={{ width: `${followupRate}%` }}
        ></div>
      </div>
    </div>

    <div className="ml-2 md:ml-3 flex-shrink-0 h-6 w-6 md:h-7 md:w-7 rounded-full bg-green-100 flex items-center justify-center">
      <Phone className="h-3 w-3 md:h-3.5 md:w-3.5 text-green-600" />
    </div>
  </div>

  {/* Active Pipeline */}
  <div className="col-span-2 md:col-span-1 flex items-center justify-between bg-white border border-purple-100 rounded-lg px-3 py-2">
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline gap-1.5 mb-0.5">
        <p className="text-sm font-bold text-purple-700 leading-none">
          {stats.new_count +
            stats.contacted_count +
            stats.interested_count}
        </p>
        <p className="text-[9px] text-gray-400">
          of {stats.total} total
        </p>
      </div>

      <p className="text-[10px] font-medium text-gray-600">
        Active Pipeline
      </p>

      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
          <span className="text-[9px] text-gray-500">
            New: {stats.new_count}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 bg-orange-500 rounded-full"></div>
          <span className="text-[9px] text-gray-500">
            Cont: {stats.contacted_count}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
          <span className="text-[9px] text-gray-500">
            Int: {stats.interested_count}
          </span>
        </div>
      </div>
    </div>

    <div className="ml-3 flex-shrink-0 h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center">
      <BarChart2 className="h-3.5 w-3.5 text-purple-600" />
    </div>
  </div>

</div>

    </div>
  );
};

export default EnquiriesStats;