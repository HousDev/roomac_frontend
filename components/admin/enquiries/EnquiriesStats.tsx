


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
    <div className="space-y-1.5 mb-2 -mt-2">

      {/* ── Top 6 status cards ──────────────────────────────────────────
          Mobile  : 3 cols × 2 rows  (grid-cols-3)
          Desktop : 6 cols × 1 row   (md:grid-cols-6)
      ────────────────────────────────────────────────────────────────── */}
 <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 ">

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




     

    </div>
  );
};

export default EnquiriesStats;