import React from "react";
import Image from "next/legacy/image";

export default function LandOne() {
  return (
    <div className="h-screen w-full bg-black text-white relative overflow-hidden">
      {/* Header Section */}
      <div className="absolute top-16 xl:top-28 w-full text-center mt-[-5%] z-10 px-4">
        <p className="text-lg sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl 3xl:text-5xl 4xl:text-6xl font-outfit leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do{" "}
          <br className="hidden sm:block" />
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>

      {/* Main Section */}
      <div className="w-full mx-auto min-h-screen flex items-center justify-center relative">
        {/* Decorative Left Rock */}
        <div className="absolute hidden lg:block left-0 top-1/2 transform -translate-y-[35vh] mt-[-15%] animate-float">
          <Image
            src="/leftrock.svg"
            alt="Left Rock"
            width={200}
            height={200}
            className="w-[30vh] lg:w-[50vh]"
          />
        </div>

        {/* Central Logo */}
        <div className="w-2/3 sm:w-1/2 lg:w-[40%] mx-auto z-10 mt-[-15%]">
          <Image
            src="/revcod.svg"
            alt="Reverse Coding"
            width={300}
            height={300}
            className="w-full h-auto"
          />
        </div>

        {/* Decorative Right Rock */}
        <div className="absolute hidden lg:block right-0 top-1/2 transform -translate-y-[48vh] animate-float mt-[-30%]">
          <Image
            src="/rightrock.svg"
            alt="Right Rock"
            width={500}
            height={500}
            className="w-[50vh]"
          />
        </div>
      </div>

      {/* Scroll to Register */}
      <div className="absolute  w-full flex justify-center mt-[-30%] xs:mt-[-24%] sm:mt-[-18%]">
        <a className="sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl 3xl:text-5xl 4xl:text-6xl font-outfit text-gray-200">
          Scroll To Register
        </a>
      </div>
    </div>
  );
}