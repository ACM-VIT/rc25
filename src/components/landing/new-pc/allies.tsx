"use client";
import React from "react";
import Image from "next/image";
import bg from "@/app/assets/bgally.svg";
import upper from "@/app/assets/upperbracket.svg";
import lower from "@/app/assets/lowerbracket.svg";

// Reusable clickable component
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

export default function Allies() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background Image */}
      <Image
        src={bg}
        alt="bg"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />

      {/* Title */}
      <div className="absolute top-[5%] w-full text-center z-10">
        <h1 className="text-white text-4xl sm:text-6xl md:text-[7rem] lg:text-[8rem] how-it-works-heading tracking-widest uppercase">
          Allies
        </h1>
      </div>

      {/* Clickable Areas Container */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full z-10">
        <div
          className="flex flex-col md:flex-row justify-center items-center 
                     space-y-8 md:space-y-0 
                     md:space-x-16 lg:space-x-32 xl:space-x-48 
                     px-4 md:px-8 lg:px-12"
        >
          <ClickableBox title="ORDER" />
          <ClickableBox title="ALLIANCE" />
          <ClickableBox title="LEGION" />
        </div>
      </div>

      {/* Vertical Scrolling Right Text */}
      <div className="absolute right-2 lg:right-8 top-0 h-full flex items-stretch z-10 py-8 overflow-hidden">
        <div
          className="text-white text-lg sm:text-xl md:text-[2.3rem] lg:text-[2.4rem] font-aurebesh tracking-[0.2em] uppercase flex-1 flex items-center justify-center whitespace-nowrap animate-vertical-scroll"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            WebkitTextStroke: "2px white",
            color: "transparent",
            textShadow:
              "0 0 10px rgba(128, 0, 128, 0.8), 0 0 20px rgba(128, 0, 128, 0.6)", // Purple glow
          }}
        >
          CODE, INVERT, CONQUER &nbsp; CODE, INVERT, CONQUER &nbsp; CODE,
          INVERT, CONQUER
        </div>
      </div>
    </div>
  );
}
