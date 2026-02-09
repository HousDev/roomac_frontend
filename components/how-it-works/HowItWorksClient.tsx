// 'use client';

// import { useMemo, useCallback, lazy, Suspense } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import Link from 'next/link';
// import QuickStats from './QuickStats';
// import StepsSection from './StepsSection';
// import FeaturesSection from './FeaturesSection';
// import CTASection from './CTASection';
// import HeroSection from './HeroSection';
// import { IconName } from './data';

// // Dynamically import icons only on client side
// const iconMap = {
//   Search: lazy(() => import('lucide-react').then(mod => ({ default: mod.Search }))),
//   Phone: lazy(() => import('lucide-react').then(mod => ({ default: mod.Phone }))),
//   Calendar: lazy(() => import('lucide-react').then(mod => ({ default: mod.Calendar }))),
//   Key: lazy(() => import('lucide-react').then(mod => ({ default: mod.Key }))),
//   Home: lazy(() => import('lucide-react').then(mod => ({ default: mod.Home }))),
//   CheckCircle: lazy(() => import('lucide-react').then(mod => ({ default: mod.CheckCircle }))),
//   UserPlus: lazy(() => import('lucide-react').then(mod => ({ default: mod.UserPlus }))),
//   CreditCard: lazy(() => import('lucide-react').then(mod => ({ default: mod.CreditCard }))),
//   Shield: lazy(() => import('lucide-react').then(mod => ({ default: mod.Shield }))),
//   Clock: lazy(() => import('lucide-react').then(mod => ({ default: mod.Clock }))),
//   Award: lazy(() => import('lucide-react').then(mod => ({ default: mod.Award }))),
//   Users: lazy(() => import('lucide-react').then(mod => ({ default: mod.Users }))),
//   Headphones: lazy(() => import('lucide-react').then(mod => ({ default: mod.Headphones }))),
// };

// interface StepData {
//   number: string;
//   iconName: IconName;
//   title: string;
//   description: string;
//   features: string[];
//   color: string;
//   bgColor: string;
// }

// interface FeatureData {
//   iconName: IconName;
//   title: string;
//   description: string;
//   color: string;
// }

// interface StatData {
//   number: string;
//   label: string;
//   iconName: IconName;
// }

// interface HowItWorksClientProps {
//   initialData: {
//     steps: StepData[];
//     features: FeatureData[];
//     quickStats: StatData[];
//   };
// }

// // Icon loader component with suspense
// function IconLoader({ name, ...props }: { name: IconName } & React.SVGProps<SVGSVGElement>) {
//   const IconComponent = iconMap[name];
  
//   return (
//     <Suspense fallback={<div className="h-5 w-5 bg-gray-300 rounded animate-pulse" />}>
//       <IconComponent {...props} />
//     </Suspense>
//   );
// }

// export default function HowItWorksClient({ initialData }: HowItWorksClientProps) {
//   // Memoize data to prevent unnecessary re-renders
//   const steps = useMemo(() => initialData.steps, [initialData.steps]);
//   const features = useMemo(() => initialData.features, [initialData.features]);
//   const quickStats = useMemo(() => initialData.quickStats, [initialData.quickStats]);

//   // Memoize callback functions
//   const handleBrowseProperties = useCallback(() => {
//     // Business logic can be added here
//     console.log('Browse properties clicked');
//   }, []);

//   const handleContactUs = useCallback(() => {
//     // Business logic can be added here
//     console.log('Contact us clicked');
//   }, []);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white">
//       <HeroSection 
//         onBrowseProperties={handleBrowseProperties}
//         onContactUs={handleContactUs}
//       />
      
//       <QuickStats stats={quickStats} IconLoader={IconLoader} />
      
//       <StepsSection steps={steps} IconLoader={IconLoader} />
      
//       <FeaturesSection features={features} IconLoader={IconLoader} />
      
//       <CTASection 
//         onBrowseProperties={handleBrowseProperties}
//         onContactUs={handleContactUs}
//         IconLoader={IconLoader}
//       />
//     </div>
//   );
// }


'use client';

import { useMemo, useCallback, lazy, Suspense, forwardRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import QuickStats from './QuickStats';
import StepsSection from './StepsSection';
import FeaturesSection from './FeaturesSection';
import CTASection from './CTASection';
import HeroSection from './HeroSection';
import { IconName } from './data';

// Dynamically import icons only on client side
const iconMap = {
  Search: lazy(() => import('lucide-react').then(mod => ({ default: mod.Search }))),
  Phone: lazy(() => import('lucide-react').then(mod => ({ default: mod.Phone }))),
  Calendar: lazy(() => import('lucide-react').then(mod => ({ default: mod.Calendar }))),
  Key: lazy(() => import('lucide-react').then(mod => ({ default: mod.Key }))),
  Home: lazy(() => import('lucide-react').then(mod => ({ default: mod.Home }))),
  CheckCircle: lazy(() => import('lucide-react').then(mod => ({ default: mod.CheckCircle }))),
  UserPlus: lazy(() => import('lucide-react').then(mod => ({ default: mod.UserPlus }))),
  CreditCard: lazy(() => import('lucide-react').then(mod => ({ default: mod.CreditCard }))),
  Shield: lazy(() => import('lucide-react').then(mod => ({ default: mod.Shield }))),
  Clock: lazy(() => import('lucide-react').then(mod => ({ default: mod.Clock }))),
  Award: lazy(() => import('lucide-react').then(mod => ({ default: mod.Award }))),
  Users: lazy(() => import('lucide-react').then(mod => ({ default: mod.Users }))),
  Headphones: lazy(() => import('lucide-react').then(mod => ({ default: mod.Headphones }))),
};

// Icon loader component with suspense - accepts all SVG props
const IconLoader = forwardRef<SVGSVGElement, { name: IconName } & React.SVGProps<SVGSVGElement>>(
  function IconLoader({ name, ...props }, ref) {
    const IconComponent : any = iconMap[name];
    
    return (
      <Suspense fallback={<div className="h-5 w-5 bg-gray-300 rounded animate-pulse" />}>
        <IconComponent 
          ref={ref}
          {...props}
        />
      </Suspense>
    );
  }
);

// Add display name for debugging
IconLoader.displayName = 'IconLoader';

interface StepData {
  number: string;
  iconName: IconName;
  title: string;
  description: string;
  features: string[];
  color: string;
  bgColor: string;
}

interface FeatureData {
  iconName: IconName;
  title: string;
  description: string;
  color: string;
}

interface StatData {
  number: string;
  label: string;
  iconName: IconName;
}

interface HowItWorksClientProps {
  initialData: {
    steps: StepData[];
    features: FeatureData[];
    quickStats: StatData[];
  };
}

export default function HowItWorksClient({ initialData }: HowItWorksClientProps) {
  // Memoize data to prevent unnecessary re-renders
  const steps = useMemo(() => initialData.steps, [initialData.steps]);
  const features = useMemo(() => initialData.features, [initialData.features]);
  const quickStats = useMemo(() => initialData.quickStats, [initialData.quickStats]);

  // Memoize callback functions
  const handleBrowseProperties = useCallback(() => {
    // Business logic can be added here
    console.log('Browse properties clicked');
  }, []);

  const handleContactUs = useCallback(() => {
    // Business logic can be added here
    console.log('Contact us clicked');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white">
      <HeroSection 
        onBrowseProperties={handleBrowseProperties}
        onContactUs={handleContactUs}
      />
      
      <QuickStats stats={quickStats} IconLoader={IconLoader} />
      
      <StepsSection steps={steps} IconLoader={IconLoader} />
      
      <FeaturesSection features={features} IconLoader={IconLoader} />
      
      <CTASection 
        onBrowseProperties={handleBrowseProperties}
        onContactUs={handleContactUs}
        IconLoader={IconLoader}
      />
    </div>
  );
}