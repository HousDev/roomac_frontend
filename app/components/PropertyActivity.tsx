import { Eye, Heart, MessageSquare, TrendingUp } from 'lucide-react';
import { PropertyActivity as PropertyActivityType } from '@/types/property';

interface PropertyActivityProps {
  activity: PropertyActivityType;
}

export function PropertyActivity({ activity }: PropertyActivityProps) {
  return (
    <div className="glass rounded-2xl p-5 shadow-xl hover-lift border-2 border-white/20">
      <h3 className="text-lg font-black gradient-text mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2" />
        Property Activity
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border-2 border-violet-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-700 font-bold">Views</span>
          </div>
          <span className="font-black text-3xl gradient-text">{activity.totalViews}</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border-2 border-rose-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-700 font-bold">Saved</span>
          </div>
          <span className="font-black text-3xl gradient-text">{activity.shortlistedBy}</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-700 font-bold">Leads</span>
          </div>
          <div className="text-right">
            <p className="font-black text-3xl gradient-text">{activity.contactRequests.count}</p>
            <p className="text-xs text-emerald-600 font-black">+{activity.contactRequests.thisWeek} this week</p>
          </div>
        </div>
      </div>
    </div>
  );
}
