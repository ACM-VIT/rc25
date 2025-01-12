import React from "react";
import Image from "next/image";

export default function LandOne() {
  return (
    <div className="h-screen bg-black text-white relative overflow-hidden">
      {/* Header Section */}
      <div className="absolute top-16 xl:top-28 w-full text-center z-10 px-4">
        <p className="text-lg sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl 3xl:text-5xl 4xl:text-6xl font-outfit leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do{" "}
          <br className="hidden sm:block" />
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>

      {/* Main Section */}
      <div className="w-full mx-auto min-h-screen flex items-center justify-center relative">
        {/* Decorative Left Rock */}
        <div className="absolute hidden lg:block left-0 top-1/2 transform -translate-y-[35vh]">
          <Image
            src="/leftrock.svg"
            alt="Left Rock"
            width={200}
            height={200}
            className="w-[30vh] lg:w-[50vh]"
          />
        </div>

        {/* Central Logo */}
        <div className="w-2/3 sm:w-1/2 lg:w-[30%] mx-auto z-10">
          <Image
            src="/revcod.svg"
            alt="Reverse Coding"
            width={300}
            height={300}
            className="w-full h-auto"
          />
        </div>

        {/* Decorative Right Rock */}
        <div className="absolute hidden lg:block right-0 top-1/2 transform -translate-y-[48vh]">
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
      <div className="absolute bottom-4 w-full flex justify-center">
        <a className="sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl 3xl:text-5xl 4xl:text-6xl font-outfit text-gray-200">
          Scroll To Register
        </a>
      </div>
    </div>
  );
}
