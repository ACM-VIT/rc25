"use client";
import React, { useEffect, useRef, useState } from "react";
import { Outfit } from "next/font/google";

const outfit = Outfit({
    subsets: ['latin'], 
    weight: ['400'],
    display: 'swap',
});

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Calculate the line height based on the content
  useEffect(() => {
    const calculateHeight = () => {
      if (!timelineRef.current) return;
      
      // Get all timeline items
      const items = timelineRef.current.querySelectorAll('.timeline-item');
      if (items.length === 0) return;
      
      // Calculate total height from first item top to last item bottom
      const firstItem = items[0].getBoundingClientRect();
      const lastItem = items[items.length - 1].getBoundingClientRect();
      // const containerTop = timelineRef.current.getBoundingClientRect().top;
      
      // Account for the container's position and add padding
      const totalHeight = (lastItem.bottom - firstItem.top) + 40; // Added padding
      setLineHeight(totalHeight);
    };

    // Calculate initially and on window resize
    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    
    // Recalculate after a short delay to account for font loading and initial renders
    const timeout = setTimeout(calculateHeight, 500);

    return () => {
      window.removeEventListener('resize', calculateHeight);
      clearTimeout(timeout);
    };
  }, [data]); // Recalculate when data changes

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !timelineRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const startTrigger = windowHeight * 0.1;
      const endTrigger = windowHeight * 0.5;
      
      const start = rect.top - startTrigger;
      const end = rect.bottom - endTrigger;
      const current = window.scrollY;
      
      const progress = Math.min(Math.max((current - start) / (end - start), 0), 1);
      setScrollProgress(progress);

      // Check which item is in view
      const items = timelineRef.current.querySelectorAll('.timeline-item');
      items.forEach((item, index) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.top + itemRect.height / 2;
        if (itemCenter > windowHeight * 0.3 && itemCenter < windowHeight * 0.7) {
          setActiveIndex(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="w-full bg-black dark:bg-neutral-950 font-outfit md:px-10"
      ref={containerRef}
    >
      <div className="max-w-7xl mx-auto py-5 phone:pb-2 phone:px-6 xs:px-8 sm:px-8 md:px-4 lg:px-10">
        <p className={`text-5xl phone:text-5xl xs:text-7xl sm:text-8xl md:text-9xl mb-4 text-white dark:text-white max-w-4xl motion-safe:animate-fade-in`} style={{color: '#F0F1FA'}}>
          TIMELINE
        </p>
      </div>
      <div ref={timelineRef} className="relative max-w-7xl mx-auto pb-20">
        {/* Timeline axis container */}
        <div className="absolute phone:left-24 xs:left-48 sm:left-60 md:left-80 left-8 top-0 h-full w-10">
          {/* Vertical line */}
          <div
            style={{
              height: `${lineHeight}px`,
              
              transition: 'height 0.3s ease-in-out'
            }}
            className="absolute left-1/2 transform -translate-x-1/2 w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
          >
            {/* Progress line */}
            <div
              style={{
                height: `${scrollProgress * lineHeight}px`,
                opacity: Math.min(scrollProgress * 10, 1),
                transition: 'height 0.1s ease-in-out'
              }}
              className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-yellow-300 via-yellow-200 to-transparent from-[0%] via-[10%] rounded-full"
            />
          </div>
        </div>

        {data.map((item, index) => (
          <div
            key={index}
            className="timeline-item flex justify-start phone:pt-6 xs:pt-6 sm:pt-6 pt-10 md:pt-32 md:gap-10 motion-safe:animate-fade-in"
            style={{
              animationDelay: `${index * 200}ms`
            }}
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              {/* Circle aligned with the timeline axis */}
              <div className="absolute left-4 phone:left-24 xs:left-48 sm:left-60 md:left-80 w-10 flex items-center justify-center">
                <div 
                  className={`rounded-full bg-black bg-opacity-50 flex items-center justify-center motion-safe:animate-scale transition-all duration-200 ${
                    activeIndex === index ? 'scale-150 border-2 border-yellow-300' : ''
                  }`}
                  style={{
                    width: '40px',
                    height: '40px',
                    transform: `scale(${activeIndex === index ? 1.5 : 1})`,
                    transformOrigin: 'center'
                  }}
                >
                  <div
                    className={`rounded-full transition-all duration-200`}
                    style={{ 
                      width: '16px',
                      height: '16px',
                      backgroundColor: 'black',
                      border: activeIndex === index ? '3px solid #FFD700' : '4px solid rgba(255, 255, 255, 0.2)'
                    }}
                  />
                </div>
              </div>

              <h3 className="text-5xl phone:text-xl phone:pl-6 xs:text-2xl xs:pl-24  sm:pl-36 md:pl-20 md:text-4xl sm:text-xl font-outfit text-white">
                <b>{item.title}</b>
              </h3>
            </div>

            <div 
              className={`relative pl-20 phone:pl-20 xs:pl-28 sm:pl-32 pr-4 md:pl-12 w-full lg:text-4xl md:text-3xl sm:text-3xl transition-all duration-300 ease-in-out ${
                activeIndex === index ? `${outfit.className} font-bold` : ''
              }`}
              style={{
                transform: `scale(${activeIndex === index ? 1.1 : 1})`,
                transformOrigin: 'left center'
              }}
            >
              {item.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
