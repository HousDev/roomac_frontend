


// components/tenant/tenant-requests/QuickRequestCards.tsx
import { Card, CardContent } from '@/components/ui/card';
import { QUICK_REQUESTS } from './requestConfig';

interface QuickRequestCardsProps {
  onQuickRequest: (type: string) => void;
}

export function QuickRequestCards({ onQuickRequest }: QuickRequestCardsProps) {
  return (
<div className="grid grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-1 mb-2 sm:mb-6">
  {QUICK_REQUESTS.map((item) => {
    const Icon = item.icon;

    return (
      <Card
        key={item.type}
        className={`cursor-pointer transition-all hover:shadow-md ${item.color} rounded-md`}
        onClick={() => onQuickRequest(item.type)}
      >
        <CardContent className="flex flex-col items-center justify-center p-1 sm:p-3">
          <Icon className="h-3 w-3 sm:h-5 sm:w-5 mb-0.5 sm:mb-1.5" />

          <h3 className="font-semibold text-[8px] sm:text-xs leading-tight text-center">
            {item.title}
          </h3>

          <p className="hidden sm:block mt-0.5 text-[10px] text-gray-600 leading-tight line-clamp-2 text-center">
            {item.description}
          </p>
        </CardContent>
      </Card>
    );
  })}
</div>
  );
}