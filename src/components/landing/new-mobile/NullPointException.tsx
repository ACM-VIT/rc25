import type React from "react";
import Image from "next/image";

const HowItWorksMobile2: React.FC = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Image
        src="https://rc25-assets.acmvit.in/HowitWorks-2.png"
        alt="bg"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />

      <div className="absolute how-it-works-heading z-10 text-white text-center w-full text-7xl lg:text-[80px] xl:text-[115px]">
        Works?
      </div>

      <div className="absolute z-10 w-full h-full flex flex-col items-left justify-center px-4 sm:px-8 md:px-16 lg:px-24">
        <div className="outfit text-white font-extrabold text-left space-y-8 sm:space-y-12 lg:space-y-16 max-w-3xl">
          <div className="flex items-start justify-start gap-4">
            <div className="text-lg sm:text-xl md:text-3xl lg:text-2xl leading-relaxed">
              Participants are given runnable files that display input-output
              test cases.
            </div>
          </div>

          <div className="flex items-start justify-start gap-4">
            <div className="text-lg sm:text-xl md:text-3xl lg:text-2xl leading-relaxed">
              After deciphering the logic based on these input-output
              patterns,they need to come up with a code that will fulfil some
              hidden test cases.
            </div>
          </div>

          <div className="flex items-start justify-start gap-4">
            <div className="text-lg sm:text-xl md:text-3xl lg:text-2xl leading-relaxed">
              The fifteen best-performing teams of Round One advance to Round
              Two.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksMobile2;
