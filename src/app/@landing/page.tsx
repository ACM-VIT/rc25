"use client";
import type React from "react";
import { useEffect, useRef } from "react";
import NewLandOne from "../../components/landing/new-pc/newlandone";
import HowItWorks from "../../components/landing/new-pc/howItWorks";
import Allies from "../../components/landing/new-pc/allies";
import Price from "../../components/landing/new-pc/price";
import TimeLine from "@/components/landing/new-pc/timeline";
import Faq from "@/components/landing/new-pc/faq";
import RegisterNow1 from "@/components/landing/new-pc/RegisterNow";
import NullPointException1 from "@/components/landing/new-pc/NullPointException";
import HowItWorksMobile from "@/components/landing/new-mobile/howitworksmobile";
import PriceMobile from "@/components/landing/new-mobile/pricemobile";
import RegisterNowMobile from "@/components/landing/new-mobile/RegisterNowMoblie";
import HowItWorksMobile2 from "@/components/landing/new-mobile/NullPointException";
import TimeLineMobile from "@/components/landing/new-mobile/timelinemobile";
import AlliesMobile from "@/components/landing/new-mobile/alliesMobile";
import LandOneMobile from "@/components/landing/new-mobile/landonemobile";
import FaqMobile from "@/components/landing/new-mobile/faqmobile";

const Layout: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const easeOutQuad = (t: number) => {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };

    const scrollHorizontally = (delta: number) => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      const start = container.scrollLeft;
      const pageWidth = container.clientWidth;
      const currentPage = Math.round(start / pageWidth);

      const direction = Math.sign(delta);
      const targetPage = Math.max(0, Math.min(currentPage + direction, 7));
      const end = targetPage * pageWidth;

      const duration = 400;
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
      if (Math.abs(event.deltaY) > 30) {
        event.preventDefault();

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
    <>
      {/* Mobile version - md and below */}
      <div className="lg:hidden flex flex-col h-screen bg-[#C2E6EC] dark:bg-[#0C1222] overflow-y-auto snap-y snap-mandatory">
        <div className="flex flex-col relative w-full">
          {/*
          <div className="sticky top-0 w-full h-screen flex flex-col snap-start shrink-0 bg-[#8DCAE9] dark:bg-[#0C1222]/20 backdrop-blur-[100px]">
            <PriceMobile />
          </div> 
          */}
          <div className="sticky top-0 w-full h-screen flex flex-col snap-start shrink-0 bg-[#8DCAE9] dark:bg-[#0C1222]/20 backdrop-blur-[100px]">
            <LandOneMobile/>
          </div>
          <div className="sticky top-0 w-full h-screen flex flex-col snap-start shrink-0 bg-[#8DCAE9] dark:bg-[#0C1222]/20 backdrop-blur-[100px]">
            <HowItWorksMobile/>
          </div>
          <div className="sticky top-0 w-full h-screen flex flex-col snap-start shrink-0 bg-[#8DCAE9] dark:bg-[#0C1222]/20 backdrop-blur-[100px]">
            <HowItWorksMobile2/>
          </div>
          <div className="sticky top-0 w-full h-screen flex flex-col snap-start shrink-0 bg-[#8DCAE9] dark:bg-[#0C1222]/20 backdrop-blur-[100px]">
          <TimeLineMobile />
          </div>
          <div>
            <FaqMobile />
          </div>
          <div className="sticky top-0 w-full h-screen flex flex-col snap-start shrink-0 bg-[#8DCAE9] dark:bg-[#0C1222]/20 backdrop-blur-[100px]">
            <AlliesMobile/>
          </div>
          <div className="sticky top-0 w-full h-screen flex flex-col snap-start shrink-0 bg-[#8DCAE9] dark:bg-[#0C1222]/20 backdrop-blur-[100px]">
            <RegisterNowMobile/>
          </div>
        </div>
      </div>

      {/* Desktop version - lg and above */}
      <div className="hidden lg:block relative w-screen h-dvh overflow-hidden">
        <div
          ref={containerRef}
          className="lg:flex overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory"
        >
          <div className="flex-none w-screen h-full snap-center shrink-0">
            <NewLandOne />
          </div>
          <div className="flex-none w-screen h-full snap-center shrink-0">
            <HowItWorks />
          </div>
          <div className="flex-none w-screen h-full snap-center shrink-0">
            <NullPointException1 />
          </div>
          <div className="flex-none w-screen h-full snap-center shrink-0">
            <TimeLine />
          </div>
          {/* <div className="flex-none w-screen h-full snap-center shrink-0">
            <Price />
          </div> */}
          <div className="flex-none w-screen h-full snap-center shrink-0">
            <Allies />
          </div>
          <div className="flex-none w-screen h-full snap-center shrink-0">
            <Faq />
          </div>
          <div className="flex-none w-screen h-full snap-center shrink-0">
            <RegisterNow1 />
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
