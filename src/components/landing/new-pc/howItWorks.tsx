import type React from "react";
import Image from "next/legacy/image";
import bg from "../../../../public/landing_new/howitworks.png";

const HowItWorks: React.FC = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Image
        src={bg || "/placeholder.svg"}
        alt="bg"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />

      {/* Left Side Text - Positioned relative to viewport width */}
      <div className="absolute left-6 xl:top-[300px] lg:top-[200px] top-[200px] translate-y-3/4 -translate-x-1/2 transform z-10">
        <div className="vertical-text transform how-it-works-heading -rotate-90 text-glow font-extrabold text-[35px] sm:text-[20px] md:text-[30px] lg:text-[30px] xl:text-[45px] tracking-widest">
          CRASH YOUR CODE SHALL NOT
        </div>
      </div>

      {/* Right Side Text - Positioned relative to viewport width */}
      <div className="absolute right-8 translate-x-1/2 transform xl:bottom-[120px] lg:bottom-[80px] -translate-y-1/2 z-10">
        <div className="vertical-text transform how-it-works-heading -rotate-90 text-glow font-extrabold text-[35px] sm:text-[20px] md:text-[30px] lg:text-[30px] xl:text-[45px] tracking-widest">
          RUST ENSURES
        </div>
      </div>

      {/* Main Heading - Centered and responsive */}
      <div className="absolute how-it-works-heading z-10 text-white text-center w-full sm:text-[80px] md:text-[110px] lg:text-[80px] xl:text-[115px]">
        How It Works?
      </div>

      {/* Main Content - Responsive positioning and spacing */}
      <div className="absolute z-10 w-full h-full flex flex-col items-end justify-center px-4 sm:px-8 md:px-16 lg:px-24 pt-[20vh]">
        <div className="text-white font-extrabold text-right outfit pace-y-8 sm:space-y-12 lg:space-y-16 max-w-3xl">
          <div className="flex items-start justify-end gap-4">
            <div className="text-lg sm:text-xl lg:text-2xl leading-relaxed">
              Participants are given runnable files that <br />
              display input-output
              <br />
              test cases.
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl">i)</div>
          </div>

          <div className="flex items-start justify-end gap-4">
            <div className="text-lg sm:text-xl lg:text-2xl leading-relaxed">
              After deciphering the logic based on these input-output <br />
              patterns, they need to come up with a code that will fulfill some
              <br />
              hidden test cases.
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl">j)</div>
          </div>

          <div className="flex items-start justify-end gap-4">
            <div className="text-lg sm:text-xl lg:text-2xl leading-relaxed">
              The best-performing teams of Round
              <br /> One advance to Round Two.
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl">k)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
