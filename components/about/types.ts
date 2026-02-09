export type IconName = 
  | 'Users' | 'Home' | 'Award' | 'Target' | 'TrendingUp' | 'Building2'
  | 'Heart' | 'Shield' | 'Zap' | 'Sparkles' | 'Globe' | 'CheckCircle';

export type StatItem = {
  number: string;
  label: string;
  icon: IconName;
  color: string;
};

export type ValueItem = {
  icon: IconName;
  title: string;
  description: string;
  color: string;
};

export type MilestoneItem = {
  year: string;
  title: string;
  description: string;
};

export type TeamItem = {
  icon: IconName;
  title: string;
  description: string;
};

export type AboutPageData = {
  stats: StatItem[];
  values: ValueItem[];
  milestones: MilestoneItem[];
  team: TeamItem[];
};