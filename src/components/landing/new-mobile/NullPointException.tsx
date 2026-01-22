import type React from "react";
import Image from "next/legacy/image";
import bg from "../../../../public/HowitWorks-2.png";

const HowItWorksMobile2: React.FC = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Image
        src={bg || "/placeholder.svg"}
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

              Once the code runs you&apos;ll be awarded with points from 0 to 100% of the points dedicated to the question on the basis of number of test cases passed.

            </div>
          </div>

          <div className="flex items-start justify-start gap-4">
            <div className="text-lg sm:text-xl md:text-3xl lg:text-2xl leading-relaxed">
              Our portal consists of inter-team plagiarism checks hence sharing codes/answers with other teams can get you disqualified.

            </div>
          </div>

          <div className="flex items-start justify-start gap-4">
            <div className="text-lg sm:text-xl md:text-3xl lg:text-2xl leading-relaxed">
              Each language has a distinct boilerplate code template, and you must write your code within the specified template.

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksMobile2;
