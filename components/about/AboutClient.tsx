'use client';

import { useMemo, useCallback } from 'react';
import AboutHeader from './AboutHeader';
import AboutStats from './AboutStats';
import AboutStory from './AboutStory';
import AboutTimeline from './AboutTimeline';
import AboutValues from './AboutValues';
import AboutCTA from './AboutCTA';
import { AboutPageData } from './types';
import { getIconComponent } from './icons';

interface AboutClientProps {
  data: AboutPageData;
}

export default function AboutClient({ data }: AboutClientProps) {
  // Transform data by adding icon components
  const transformedData = useMemo(() => {
    return {
      stats: data.stats.map(stat => ({
        ...stat,
        iconComponent: getIconComponent(stat.icon)
      })),
      values: data.values.map(value => ({
        ...value,
        iconComponent: getIconComponent(value.icon)
      })),
      team: data.team.map(item => ({
        ...item,
        iconComponent: getIconComponent(item.icon)
      })),
      milestones: data.milestones
    };
  }, [data]);

  // Memoize animation callbacks
  const handleStatsAnimation = useCallback((index: number) => {
  }, []);

  const handleValueHover = useCallback((index: number) => {
    console.log(`Value ${index} hovered`);
  }, []);

  const handleTimelineScroll = useCallback(() => {
    // Handle timeline scroll logic
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white">
      <AboutHeader />
      <AboutStats 
        stats={transformedData.stats} 
        onAnimationComplete={handleStatsAnimation}
      />
      <AboutStory team={transformedData.team} />
      <AboutTimeline 
        milestones={transformedData.milestones} 
        onScroll={handleTimelineScroll}
      />
      <AboutValues 
        values={transformedData.values} 
        onHover={handleValueHover}
      />
      <AboutCTA />
    </div>
  );
}