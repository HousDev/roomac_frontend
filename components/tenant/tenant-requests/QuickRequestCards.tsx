import { Card, CardContent } from '@/components/ui/card';
import { QUICK_REQUESTS } from './requestConfig';

interface QuickRequestCardsProps {
  onQuickRequest: (type: string) => void;
}

export function QuickRequestCards({ onQuickRequest }: QuickRequestCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
      {QUICK_REQUESTS.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.type}
            className={`cursor-pointer transition-all hover:shadow-lg ${item.color}`}
            onClick={() => onQuickRequest(item.type)}
          >
            <CardContent className="p-4">
              <Icon className="h-6 w-6 mb-2" />
              <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-gray-600">{item.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}