"use client";

import type React from "react";
import Image from "next/image";
import R2d2 from "../../../../public/r2d2.png";

const NullPointException1: React.FC = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#1a1a2e]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          alt="background"
          src="/NullPointBackground.png"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-full w-full items-center justify-between px-4 md:px-8">
        {/* Text Content */}
        <div className="w-full lg:max-w-3xl md:max-w-2xl sm:max-w-lg max-w-md">
          <div className="space-y-4 text-white outfit font-extrabold text-lg sm:text-xl lg:text-2xl leading-relaxed">
            <div className="flex gap-4 ">
              <span>l.</span>
              <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed ">
                Once the code runs you'll be awarded with points from 0 to 100% of the points dedicated to the question on the basis of number of test cases passed.
              </p>
            </div>

            <div className="flex gap-4">
              <span>m.</span>
              <p>
                Our portal consists of inter-team plagiarism checks hence sharing codes/answers with other teams can get you disqualified.
              </p>
            </div>

            <div className="flex gap-4">
              <span>n.</span>
              <p>
                Each language has a distinct boilerplate code template, and you must write your code within the specified template.
              </p>
            </div>
          </div>
        </div>
        {/* R2D2 Image */}
        <div className="relative h-full w-1/3">
          <div className="absolute bottom-10 right-0 w-full">
            <Image
              alt="R2D2"
              src={R2d2 || "/placeholder.svg"}
              className="scale-125 transform fix"
              priority
            />
          </div>
        </div>

        {/* Vertical "works?" Text */}
        <div className=" right-0 translate-y-1 transform">
          <div className="flex h-screen items-center">
            <p className="rotate-180 text-[8vw] text-glow how-it-works-heading font-bold text-white/70 [writing-mode:vertical-lr]">
              works?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NullPointException1;
