"use client";
import React, { useEffect, useRef } from "react";
// import NewLandOne from "../../components/landing/new-pc/newlandone";
import LandingNavbar from "../../components/landing/landing-navbar";
import HowItWorks from "../../components/landing/new-pc/howItWorks";
import Allies from "../../components/landing/new-pc/allies";
import Price from "../../components/landing/new-pc/price";

const Layout: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // A more "ease-out" style function
    const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);

    const scrollHorizontally = (delta: number) => {
      // Cancel any ongoing animation before starting a new one
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      const start = container.scrollLeft;
      const end = start + delta * 5; // Adjust this multiplier to control "speed"
      const duration = 500; // Adjust duration (ms) for overall "smoothness"

      let startTime: number | null = null;

      const animate = (time: number) => {
        if (!startTime) startTime = time;
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuad(progress);

        container.scrollLeft = start + (end - start) * easedProgress;

        if (progress < 1) {
          animationFrameId.current = requestAnimationFrame(animate);
        } else {
          animationFrameId.current = null;
          isScrolling.current = false;
        }
      };

      animationFrameId.current = requestAnimationFrame(animate);
    };

    const onWheel = (event: WheelEvent) => {
      // Only act if it's primarily a vertical scroll
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        // Prevent the default vertical scroll behavior
        event.preventDefault();

        // If we are already animating a scroll, ignore new wheel events
        if (isScrolling.current) return;

        isScrolling.current = true;
        scrollHorizontally(event.deltaY);
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", onWheel);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <div className="relative w-screen h-dvh overflow-hidden">
      <div
        ref={containerRef}
        className="flex overflow-x-auto overflow-y-hidden"
      >
        <div className="flex-none w-screen h-full">
          {/* <NewLandOne /> */}
          <LandingNavbar />

          
        </div>
        <div className="flex-none w-screen h-full">
          <HowItWorks />
        </div>
        <div className="flex-none w-screen h-full">
          <Allies />
        </div>
        <div className="flex-none w-screen h-full">
          <Price />
        </div>
      </div>
    </div>
  );
};

export default Layout;
