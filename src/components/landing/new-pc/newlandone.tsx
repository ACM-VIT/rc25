import React from "react";
import Image from "next/image";
import backgroundone from "@/app/assets/backgroundone.svg";
import earthone from "@/app/assets/earthone.svg";
import wrclogo from "@/app/assets/wrclogo.svg";
import acm from "@/app/assets/acm.svg";
import join from "@/app/assets/join.svg";

export default function NewLandOne() {
  return (
    <div className="h-screen w-full">
      {/* Main container with flex */}
      <div className="h-full w-full flex flex-col justify-between items-center overflow-hidden relative">
        {/* Background image wrapper */}
        <div className="fixed inset-0 z-0">
          <Image
            src={backgroundone}
            alt="background"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* ACM Logo with Fade-In */}
        <div className="z-10 xl:w-[15%] lg:w-[20%] md:w-[24%] sm:w-[24%] xs:w-[30%] phone:w-[35%] justify-center items-center flex flex-col mt-[2%] animate-fadeIn">
          <Image src={acm} alt="ACM" />
        </div>

        {/* RCLogo wrapper with Fade-In */}
        <div className="flex flex-col justify-center items-center z-10 phone:mt-[40%] xs:mt-[0%] sm:mt-[5%] md:mt-[0%] lg:mt-[0%] xl:mt-[2%] 2xl:mt-[3%] animate-fadeIn">
          <Image
            src={wrclogo}
            alt="Reverse Coding"
            className="2xl:w-[30rem] xl:w-[37rem] lg:w-[34rem] md:w-[31rem] sm:w-[28rem] xs:w-[24rem] phone:w-[20rem]"
          />
          <div
            className="2xl:text-[7rem] xl:text-[3.2rem] lg:text-[3rem] md:text-[2.8rem] sm:text-[2.4rem] xs:text-[2.1rem] phone:text-[1.7rem] mt-[2%] how-it-works-heading whitespace-nowrap justify-center items-center flex flex-col font-custom animate-fadeIn"
            style={{
              color: "transparent",
              WebkitTextStroke: "1px white",
              textShadow: "none",
            }}
          >
            Code, Invert, Conquer
          </div>
        </div>

        {/* Left-Aligned Text: "TO REVERSE CODING" Ending at the Top */}
        <div className="absolute left-6 xl:top-[250px] lg:top-[200px] top-[200px] -translate-x-1/2 transform z-10">
          <div className="vertical-text transform how-it-works-heading -rotate-90 text-glow font-extrabold text-[35px] sm:text-[20px] md:text-[30px] lg:text-[30px] xl:text-[45px] tracking-widest">
            TO REVERSE CODING
          </div>
        </div>

        <div className="absolute right-6  translate-x-1/2 transform xl:bottom-[180px] lg:bottom-[130px] bottom-[120px] -translate-y-3/4 z-10">
          <div className="vertical-text transform how-it-works-heading rotate-90 text-glow font-extrabold text-[35px] sm:text-[20px] md:text-[30px] lg:text-[30px] xl:text-[45px] tracking-widest">
            WELCOME YOU ARE
          </div>
        </div>

        {/* Join button */}
        <div
          className="absolute z-20 left-1/2 transform -translate-x-1/2
                      2xl:w-[20rem] xl:w-[18rem] lg:w-[18rem] md:w-[16rem] sm:w-[14rem] xs:w-[12rem] w-[10rem]
                      2xl:bottom-[8%] xl:bottom-[5%] lg:bottom-[2%] md:bottom-[0%] sm:bottom-[5%] xs:bottom-[2%] bottom-[0%]"
        >
          <Image src={join} alt="Join" />
        </div>

        {/* Earth image wrapper */}
        <div className="flex justify-center z-10">
          <Image
            src={earthone}
            alt="earth"
            className="w-[200%] sm:w-[170%] md:w-[140%] lg:w-[120%] xl:w-[100%] 
                       phone:mt-[10%] xs:mt-[20%] sm:mt-[-5%] md:mt-[-8%] lg:mt-[-10%] xl:mt-[-13%] 2xl:mt-[-15%] animate-spin-slow"
          />
        </div>
      </div>
    </div>
  );
}
