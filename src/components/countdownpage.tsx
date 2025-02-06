"use client";
import { useEffect, useRef } from "react";
import React from "react";
import Image from "next/image";
import bg from "@/app/assets/backgroundone.svg";
import earthone from "@/app/assets/rounded_earth.svg";

const Counter: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  //use effect to highlight the iframe when the page is opened
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.focus();
    }
  }, []);
  return (
    <div className="h-screen w-full">
      {/* Main container */}
      <div className="h-full w-full flex flex-col justify-between items-center overflow-hidden relative">
        {/* Background */}
        <div className="absolute inset-0 z-5">
          <Image
            src={bg}
            alt="background"
            fill
            className="object-cover object-center"
            priority
            style={{ filter: "grayscale(50%) brightness(80%) contrast(90%)" }}
          />
        </div>

        {/* Title Section */}
        <div className="absolute top-14 text-center text-white z-10">
          <h1 className="text-3xl sm:text-4xl md:text-6xl how-it-works-heading tracking-widest">
            WELCOME TO
          </h1>
          <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl how-it-works-heading text-[#9850DB]">
            REVERSE CODING{" "}
            <span
              className="text-white"
              style={{
                color: "transparent",
                WebkitTextStroke: "1px #CEB7FF",
                textShadow: "none",
              }}
            >
              2025
            </span>
          </h2>
        </div>

        {/* Board */}
        <div className="absolute mt-2 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/4 z-50 scale-[0.9]">
          <iframe
            ref={iframeRef}
            src="https://2048-main-delta.vercel.app/"
            title="2048 Game"
            className="w-[500px] h-[600px] z-50 object-fill"
          />
        </div>

        {/* Rotating Earth */}
        <div className="flex justify-center z-0 scale-[200%] lg:translate-y-[5%]">
          <Image
            src={earthone}
            alt="earth"
            className="-z-10 w-[150%] sm:w-[170%] md:w-[140%] lg:w-[150%] xl:w-[100%] 
                                   phone:mt-[100%] xs:mt-[70%] sm:mt-[60%] md:mt-[50%] lg:mt-[40%] xl:mt-[40%] 2xl:mt-[40%] animate-spin-slow"
            style={{ filter: "grayscale(50%) brightness(80%) contrast(90%)" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Counter;
