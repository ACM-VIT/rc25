"use client";
import React from "react";
import Image from "next/image";
import bg from "@/app/assets/bgally.svg";
import upper from "@/app/assets/upperbracket.svg";
import lower from "@/app/assets/lowerbracket.svg";
import SmoothInfiniteScroll from "./infinitescroll";
import judge0 from "../../../../public/judge0.svg";
import easeMyTrip from "../../../../public/easemytrip.svg";

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
        <div className="flex flex-col justify-center items-center h-full w-full gap-y-16 lg:gap-y-32 xl:gap-y-48 flex-wrap">
          {/* First Image Container */}
          <a href="https://judge0.com/" target="_blank" rel="noreferrer">
            <div className="relative flex flex-row items-center justify-center text-white transition-transform duration-200 mx-6 my-4 cursor-pointer hover:scale-[1.05]">
              {/* Top bracket */}
              <div className="absolute -top-10 -left-10 md:-top-12 md:-left-12 lg:-top-14 lg:-left-14">
                <Image
                  src={upper}
                  alt="upper bracket"
                  width={40}
                  height={40}
                  className="w-[35px] h-[35px] md:w-[40px] md:h-[40px] lg:w-[45px] lg:h-[45px] xl:w-[50px] xl:h-[50px] scale-125"
                />
              </div>

              {/* Main Image */}
              <Image
                src={judge0}
                alt="Judge0"
                width={150}
                height={150}
                className="p-3 max-w-full h-auto w-[250px] md:w-[300px] lg:w-[350px] xl:w-[400px]"
              />

              {/* Bottom bracket */}
              <div className="absolute -bottom-10 -right-10 md:-bottom-12 md:-right-12 lg:-bottom-14 lg:-right-14">
                <Image
                  src={lower}
                  alt="lower bracket"
                  width={40}
                  height={40}
                  className="w-[35px] h-[35px] md:w-[40px] md:h-[40px] lg:w-[45px] lg:h-[45px] xl:w-[50px] xl:h-[50px] scale-125"
                />
              </div>
            </div>
          </a>
          {/* Second Image Container */}
          <a
            href="https://www.easemytrip.com/"
            target="_blank"
            rel="noreferrer"
          >
            <div className="relative flex flex-row items-center justify-center text-white transition-transform ursor-pointer hover:scale-[1.05] duration-200 mx-6 my-4">
              {/* Top bracket */}

              <div className="absolute -top-6 -left-10 md:-top-6 md:-left-12 lg:-top-6 lg:-left-14">
                <Image
                  src={upper}
                  alt="upper bracket"
                  width={40}
                  height={40}
                  className="w-[35px] h-[35px] md:w-[40px] md:h-[40px] lg:w-[45px] lg:h-[45px] xl:w-[50px] xl:h-[50px] scale-125"
                />
              </div>

              {/* Main Image */}
              <Image
                src={easeMyTrip}
                alt="EaseMyTrip"
                width={350}
                height={350}
                className="p-3 max-w-full h-auto w-[250px] md:w-[300px] lg:w-[350px] xl:w-[400px]"
              />

              {/* Bottom bracket */}
              <div className="absolute -bottom-6 -right-10 md:-bottom-6 md:-right-12 lg:-bottom-6 lg:-right-14">
                <Image
                  src={lower}
                  alt="lower bracket"
                  width={40}
                  height={40}
                  className="w-[35px] h-[35px] md:w-[40px] md:h-[40px] lg:w-[45px] lg:h-[45px] xl:w-[50px] xl:h-[50px] scale-125"
                />
              </div>
            </div>
          </a>
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
