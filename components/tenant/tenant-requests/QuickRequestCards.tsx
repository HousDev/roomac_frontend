// import { Card, CardContent } from '@/components/ui/card';
// import { QUICK_REQUESTS } from './requestConfig';

// interface QuickRequestCardsProps {
//   onQuickRequest: (type: string) => void;
// }

// export function QuickRequestCards({ onQuickRequest }: QuickRequestCardsProps) {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
//       {QUICK_REQUESTS.map((item) => {
//         const Icon = item.icon;
//         return (
//           <Card
//             key={item.type}
//             className={`cursor-pointer transition-all hover:shadow-lg ${item.color}`}
//             onClick={() => onQuickRequest(item.type)}
//           >
//             <CardContent className="p-4">
//               <Icon className="h-6 w-6 mb-2" />
//               <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
//               <p className="text-xs text-gray-600">{item.description}</p>
//             </CardContent>
//           </Card>
//         );
//       })}
//     </div>
//   );
// }


import { Card, CardContent } from '@/components/ui/card';
import { QUICK_REQUESTS } from './requestConfig';

interface QuickRequestCardsProps {
  onQuickRequest: (type: string) => void;
}

export function QuickRequestCards({ onQuickRequest }: QuickRequestCardsProps) {
  return (
<div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 sm:gap-4 mb-3 sm:mb-8">      {QUICK_REQUESTS.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.type}
            className={`cursor-pointer transition-all hover:shadow-md sm:hover:shadow-lg ${item.color} rounded-lg`}
            onClick={() => onQuickRequest(item.type)}
          >
<CardContent className="p-1.5 sm:p-4">       
         <Icon className="h-3.5 w-3.5 sm:h-6 sm:w-6 mb-0.5 sm:mb-2" />
              <h3 className="font-semibold text-[9px] sm:text-sm mb-0 sm:mb-1 leading-tight">
                {item.title}
              </h3>
              <p className="text-[8px] sm:text-xs text-gray-600 leading-tight line-clamp-2 hidden sm:block">
                {item.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}