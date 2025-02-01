"use client";
import type React from "react";
import { useEffect, useRef } from "react";
import NewLandOne from "../../components/landing/new-pc/newlandone";
import HowItWorks from "../../components/landing/new-pc/howItWorks";
import Allies from "../../components/landing/new-pc/allies";
// import Prize from "../../components/landing/new-pc/prize"; -- Redacted for now as it is not used
import TimeLine from "@/components/landing/new-pc/timeline";
import Faq from "@/components/landing/new-pc/faq";
import RegisterNow1 from "@/components/landing/new-pc/RegisterNow";
import NullPointException1 from "@/components/landing/new-pc/NullPointException";
import HowItWorksMobile from "@/components/landing/new-mobile/howitworksmobile";
// import PrizeMobile from "@/components/landing/new-mobile/prizemobile"; -- Redacted for now as it is not used
import RegisterNowMobile from "@/components/landing/new-mobile/RegisterNowMoblie";
import HowItWorksMobile2 from "@/components/landing/new-mobile/NullPointException";
import TimeLineMobile from "@/components/landing/new-mobile/timelinemobile";
import AlliesMobile from "@/components/landing/new-mobile/alliesMobile";
import LandOneMobile from "@/components/landing/new-mobile/landonemobile";
import FaqMobile from "@/components/landing/new-mobile/faqmobile";

const ScrollWrapper: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const lastScrollTime = useRef(Date.now());
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = (event: WheelEvent) => {
      event.preventDefault();

      const now = Date.now();
      if (now - lastScrollTime.current < 500 || isScrolling.current) {
        return;
      }

      const deltaY = Math.abs(event.deltaY) > 30 ? Math.sign(event.deltaY) : 0;
      if (deltaY === 0) return;

      isScrolling.current = true;
      lastScrollTime.current = now;

      const pageWidth = container.clientWidth;
      const currentScroll = container.scrollLeft;
      const currentPage = Math.round(currentScroll / pageWidth);
      const targetPage = Math.max(0, Math.min(currentPage + deltaY, 7));

      container.scrollTo({
        left: targetPage * pageWidth,
        behavior: "smooth",
      });

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        isScrolling.current = false;
      }, 500);
    };

    // Prevent any default scroll behavior
    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    // Add event listeners
    container.addEventListener("wheel", handleScroll, { passive: false });
    document.body.style.overflow = "hidden";
    window.addEventListener("scroll", preventScroll, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleScroll);
      window.removeEventListener("scroll", preventScroll);
      document.body.style.overflow = "";
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  return (
    <>
      <div className="lg:hidden flex flex-col h-screen bg-[#C2E6EC] dark:bg-[#0C1222] overflow-y-auto snap-y snap-mandatory ease-in">
        <div className="flex flex-col relative w-full">
          <div className="sticky top-0 w-full h-screen flex flex-col snap-start shrink-0">
            <LandOneMobile />
          </div>
          <div className="sticky top-0 w-full h-screen flex flex-col snap-start shrink-0">
            <HowItWorksMobile />
          </div>
          <div className="sticky top-0 w-full h-screen flex flex-col snap-start shrink-0">
            <HowItWorksMobile2 />
          </div>
          <div className="sticky top-0 w-full h-screen flex flex-col snap-start shrink-0">
            <TimeLineMobile />
          </div>
          {/* <div className="sticky top-0 w-full h-screen flex flex-col snap-start shrink-0">
            <PriceMobile />
          </div> */}
          <div className="sticky top-0 w-full h-screen flex flex-col snap-start shrink-0">
            <AlliesMobile />
          </div>
          <div className="sticky top-0 w-full h-screen flex flex-col snap-start shrink-0 ">
            <FaqMobile />
          </div>
          <div className="sticky top-0 w-full h-screen flex flex-col snap-start shrink-0">
            <RegisterNowMobile />
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

export default ScrollWrapper;
