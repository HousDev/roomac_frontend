import { useState, useEffect, useRef, useCallback } from 'react';

interface UseIntersectionObserverProps {
  sectionIds: string[];
  threshold?: number;
  rootMargin?: string;
}

interface IntersectionRefs {
  [key: string]: React.RefObject<HTMLElement>;
}

export function useIntersectionObserver({
  sectionIds,
  threshold = 0.1,
  rootMargin = '0px 0px -100px 0px'
}: UseIntersectionObserverProps) {
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>(
    sectionIds.reduce((acc, id) => ({ ...acc, [id]: false }), {})
  );

  const refs = useRef<IntersectionRefs>(
    sectionIds.reduce((acc, id) => {
      acc[`${id}Ref`] = { current: null };
      return acc;
    }, {} as IntersectionRefs)
  ).current;

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        setVisibleSections(prev => ({
          ...prev,
          [id]: true
        }));
      }
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    });

    sectionIds.forEach(id => {
      const refKey = `${id}Ref`;
      const ref = refs[refKey];
      if (ref?.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sectionIds, threshold, rootMargin, handleIntersection, refs]);

  return { visibleSections, refs };
}