"use client";
import React from "react";
import Image from "next/image";
import bg from "@/app/assets/bgally.svg";
import upper from "@/app/assets/upperbracket.svg";
import lower from "@/app/assets/lowerbracket.svg";
import SmoothInfiniteScroll from "./infinitescroll";

const ClickableBox = ({ title }: { title: string }) => (
  <div className="relative flex flex-col items-center text-white transform hover:scale-105 transition-transform duration-200 mx-6 my-4">
    {/* Top bracket */}
    <div className="absolute -top-3 -left-3">
      <Image
        src={upper}
        alt="upper bracket"
        width={40}
        height={40}
        className="md:w-[45px] md:h-[45px] lg:w-[50px] lg:h-[50px]"
      />
    </div>

    {/* Text content */}
    <div className="flex flex-col items-center space-y-1 px-4 py-2">
      <span
        className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold"
        style={{
          textShadow: "0 0 5px rgba(255,255,255,0.7)",
          WebkitTextStroke: "0.5px white",
        }}
      >
        CLICK
      </span>
      <span
        className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold"
        style={{
          textShadow: "0 0 5px rgba(255,255,255,0.7)",
          WebkitTextStroke: "0.5px white",
        }}
      >
        TO JOIN THE
      </span>
      <span
        className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold"
        style={{
          textShadow: "0 0 5px rgba(255,255,255,0.7)",
          WebkitTextStroke: "0.5px white",
        }}
      >
        {title}
      </span>
    </div>

    {/* Bottom bracket */}
    <div className="absolute -bottom-3 -right-3">
      <Image
        src={lower}
        alt="lower bracket"
        width={40}
        height={40}
        className="md:w-[45px] md:h-[45px] lg:w-[50px] lg:h-[50px]"
      />
    </div>
  </div>
);

function AlliesMobile() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="h-full w-full flex flex-col justify-between items-center relative">
        {/* Background image wrapper */}
        <div className="absolute inset-0 z-0 brightness-200">
          <Image
            src={bg}
            alt="background"
            fill
            className="object-cover object-[20%] md:object-[0%]"
            priority
          />
        </div>
        <div className="absolute  phone:top-[2%] w-full text-center z-10">
          <h1 className="text-white phone:text-[5rem] xs:text-[6rem] sm:text-[7rem] how-it-works-heading uppercase">
            Allies
          </h1>
        </div>
        <div className="absolute top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full z-10">
          <div
            className="flex flex-col md:flex-row justify-center items-center 
               space-y-12 sm:space-y-10  md:space-y-0 
               md:space-x-16  
               px-6 md:px-8"
          >
            <ClickableBox title="ORDER" />
            <ClickableBox title="ALLIANCE" />
            <ClickableBox title="LEGION" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-[7vh] xs-sm:bottom-[10vh] sm:bottom-[11vh] w-full z-10 rotate-[-10deg] overflow-hidden">
        <SmoothInfiniteScroll
          text="Code Invert Conquer"
          speed={0.5}
          font="font-aurebesh"
        />
      </div>
    </div>
  );
}

export default AlliesMobile;
