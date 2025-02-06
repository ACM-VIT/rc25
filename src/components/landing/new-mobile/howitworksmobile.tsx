import type React from "react";
import Image from "next/image";
import bg from "../../../../public/landing_new/howitworks.png";
import SmoothInfiniteScroll from "./infinitescroll";

const HowItWorksMobile: React.FC = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Image
        src={bg || "/placeholder.svg"}
        alt="bg"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />

      {/* Main Heading - Centered and responsive */}
      <div className="absolute how-it-works-heading z-10 text-white text-center w-full text-7xl lg:text-[80px] xl:text-[115px]">
        How It Works?
      </div>

      {/* Main Content - Responsive positioning and spacing */}
      <div className="absolute z-10 w-full h-full flex flex-col items-left justify-center px-4 sm:px-8 md:px-16 lg:px-24">
        <div className="outfit text-white font-extrabold text-left space-y-8 sm:space-y-12 lg:space-y-16 max-w-3xl">
          <div className="flex items-start justify-start gap-4">
            <div className="text-lg sm:text-xl md:text-3xl lg:text-2xl leading-relaxed">
              All participants will be given executable files that display input-output test cases.
            </div>
          </div>

          <div className="flex items-start justify-start gap-4">
            <div className="text-lg sm:text-xl md:text-3xl lg:text-2xl leading-relaxed">
             The code you write should implement the logic based on these input-output files and also fulfill some hidden test cases.
            </div>
          </div>

          <div className="flex items-start justify-start gap-4">
            <div className="text-lg sm:text-xl md:text-3xl lg:text-2xl leading-relaxed">
              The best performing teams of round 1 will advance to round 2.
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-[7vh] xs-sm:bottom-[10vh] sm:bottom-[11vh] w-full z-10 rotate-[-10deg]">
        <SmoothInfiniteScroll text="Crash your code shall not" speed={0.5} />
        <SmoothInfiniteScroll
          text="Rust Ensures &nbsp; Rust Ensures"
          speed={0.6}
        />
      </div>
    </div>
  );
};

export default HowItWorksMobile;
