import { 
  Users, Home, Award, Target, TrendingUp, Building2,
  Heart, Shield, Zap, Sparkles, Globe, CheckCircle 
} from 'lucide-react';
import { IconName } from './types';

export const iconMap: Record<IconName, React.ComponentType<any>> = {
  'Users': Users,
  'Home': Home,
  'Award': Award,
  'Target': Target,
  'TrendingUp': TrendingUp,
  'Building2': Building2,
  'Heart': Heart,
  'Shield': Shield,
  'Zap': Zap,
  'Sparkles': Sparkles,
  'Globe': Globe,
  'CheckCircle': CheckCircle
};

export function getIconComponent(name: IconName): React.ComponentType<any> {
  return iconMap[name];
}