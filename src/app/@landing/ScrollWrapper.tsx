"use client";
import type React from "react";
import NewLandOne from "../../components/landing/new-pc/newlandone";
import HowItWorks from "../../components/landing/new-pc/howItWorks";
import Allies from "../../components/landing/new-pc/allies";
// import Prize from "../../components/landing/new-pc/prize";
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
import { useHorizontalScroll } from "./scroll";

const ScrollWrapper: React.FC = () => {
    const scrollMap = useHorizontalScroll();

    return (
        <>
            <div className="lg:hidden flex flex-col h-screen bg-[#C2E6EC] dark:bg-[#0C1222] overflow-y-auto snap-y snap-mandatory ease-in">
                <div className="flex flex-col relative w-full">
                    <div className="top-0 w-full h-screen flex flex-col snap-start shrink-0">
                        <LandOneMobile />
                    </div>
                    <div className="top-0 w-full h-screen flex flex-col snap-start shrink-0">
                        <HowItWorksMobile />
                    </div>
                    <div className="top-0 w-full h-screen flex flex-col snap-start shrink-0">
                        <HowItWorksMobile2 />
                    </div>
                    <div className="top-0 w-full h-screen flex flex-col snap-start shrink-0">
                        <TimeLineMobile />
                    </div>
                    <div className="top-0 w-full h-screen flex flex-col snap-start shrink-0">
                        <AlliesMobile />
                    </div>
                    <div className="top-0 w-full h-screen flex flex-col snap-start shrink-0 ">
                        <FaqMobile />
                    </div>
                    <div className="relative top-0 w-full h-screen flex flex-col snap-start shrink-0">
                        <RegisterNowMobile />
                    </div>
                </div>
            </div>

            {/* Desktop version - lg and above */}
            <div className="hidden lg:block relative w-screen h-dvh overflow-hidden">
                <div
                    ref={scrollMap}
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
            <Prize />
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
