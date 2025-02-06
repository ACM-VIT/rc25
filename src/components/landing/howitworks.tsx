"use client"; // Ensures this is a client-side component

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import rock2 from "@/app/assets/rock2.svg";
import { Outfit } from "next/font/google";

const outfit= Outfit({
    subsets: ['latin'], 
    weight: ['400'] ,
    display: 'swap',
  });

export default function HowItWorks() {
  const [isMainVisible, setIsMainVisible] = useState(false); // For the first section
  const [isLastVisible, setIsLastVisible] = useState(false); // For the last section
  const textSectionRef = useRef<HTMLDivElement>(null);
  const lastSectionRef = useRef<HTMLDivElement>(null);

  // Use IntersectionObserver to trigger animation for both sections
  useEffect(() => {
    const currentRef = textSectionRef.current; // Store ref in variable
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsMainVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }
    const o = textSectionRef.current

    return () => {
      if (o) {
        observer.unobserve(o);
      }
    };
  }, []);

  useEffect(() => {
    const currentRef = lastSectionRef.current; // Store ref in variable
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLastVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    const l = lastSectionRef.current;
    return () => {
      if (l) {
        observer.unobserve(l);
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full bg-black overflow-x-hidden">
      {/* Header Section */}
      <div className="flex h-full items-center justify-center">
        <div className={`bg-gradient-to-b from-[#F0F1FA] to-[#ACADB5] bg-clip-text text-transparent text-center phone:text-[4rem] xs:text-[6rem] sm:text-[4rem] md:text-[4rem] lg:text-[4rem] xl:text-[1rem] overflow-y-auto`}>
          HOW IT WORKS?
        </div>
      </div>

      {/* Main Content Section */}
      <div
  ref={textSectionRef}
  className={`mt-[5%] md:ml-[20%]  flex flex-row justify-end w-full md:w-3/4 items-center transition-transform duration-[1000ms] ease-out ${
    isMainVisible ? "translate-x-0 opacity-100" : "translate-x-[50%] opacity-0"
  } overflow-x-hidden relative`}
>
  {/* Main Content */}
  <div className="flex flex-col w-full md:w-auto md:ml-[40%] lg:ml-[38%] border-r-8 py-8 border-white px-4 sm:px-6 lg:px-8">
    <p className={`text-white text-center phone:text-right xs:text-right text-base phone:text-[80%] xs:text-lg md:text-xl lg:text-2xl xl:text-3xl font-para whitespace-nowrap ${outfit.className}`}>
      Participants are given runnable files that
    </p>
    <p className={`text-white text-center phone:text-right xs:text-right text-base phone:text-[80%] xs:text-lg md:text-xl lg:text-2xl xl:text-3xl  font-para whitespace-nowrap ${outfit.className}`}>
      display input-output
    </p>
    <p className={`text-white text-center phone:text-right xs:text-right text-base phone:text-[80%] xs:text-lg md:text-xl lg:text-2xl xl:text-3xl font-para whitespace-nowrap  mb-6 lg:mb-10${outfit.className}`}>
      test cases.
    </p>
    <p className={`text-white text-center phone:text-right xs:text-right text-base phone:text-[80%] xs:text-lg md:text-xl lg:text-2xl xl:text-3xl font-para xs:whitespace-nowrap ${outfit.className}`}>
      After deciphering the logic based on these input-
    </p>
    <p className={`text-white text-center phone:text-right xs:text-right text-base phone:text-[80%] xs:text-lg md:text-xl lg:text-2xl xl:text-3xl font-para xs:whitespace-nowrap ${outfit.className}`}>
      output patterns, they need to come up with a code
    </p>
    <p className={`text-white text-center phone:text-right xs:text-right text-base phone:text-[80%] xs:text-lg md:text-xl lg:text-2xl xl:text-3xl font-para whitespace-nowrap  mb-6 lg:mb-10${outfit.className}`}>
      that will fulfil some hidden test cases.
    </p>
    <p className={`text-white text-center phone:text-right xs:text-right text-base phone:text-[80%] xs:text-lg md:text-xl lg:text-2xl xl:text-3xl font-para whitespace-nowrap ${outfit.className}`}>
      The best-performing teams of Round
    </p>
    <p className={`text-white text-center phone:text-right xs:text-right text-base phone:text-[80%] xs:text-lg md:text-xl lg:text-2xl xl:text-3xl font-para whitespace-nowrap${outfit.className}`}>
      One advance to Round Two.
    </p>
  </div>

  {/* Vertical Text */}
  <div className="w-[10%] flex items-center justify-center mt-8 phone:mt-[-2%] xs:mt-[1%] sm:mt-[-2%] md:mt-[1%] lg:mt-[-1%] xl:mt-[1%]">
      <p 
        className={`text-[85%] phone:text-[70%] sm:text-[95%] md:text-[95%] lg:text-[110%] xl:text-[110%] tracking-[0.2em] uppercase  -rotate-90 whitespace-nowrap transform origin-center`}
        style={{
          color: 'transparent',
          WebkitTextStroke: '1px white',
          textShadow: 'none'
        }}
      >
        &#34;It works on my machine.&#34;
      </p>
    </div>
</div>


      {/* Static Rock Image */}
      <div className="flex h-full justify-start ml-[-12%] mt-[-5%]">
        <Image
          className="hidden md:block h-auto max-h-[80vh] animate-float"
          src={rock2}
          alt="Left SVG Image"
        />
      </div>

      {/* Last Section with Sliding Effect */}
      <div
  ref={lastSectionRef}
  className={`flex flex-row justify-end phone:ml-[5%] mt-[10%] md:mt-[-6%] ml-[5%] md:ml-[10%]  lg:ml-[10%] w-full md:w-3/4 transition-transform duration-[1000ms] ease-out ${
    isLastVisible ? "translate-x-0 opacity-100" : "translate-x-[-50%] opacity-0"
  }`}
>
  <div className="flex flex-row mb-20">
    {/* Vertical Text */}
    <div className="absolute top-1/2 left-0  transform -translate-y-1/2 w-[2%] phone:top-[15%] xs:top-[14%] sm:top-[7%] xl:top-[8%] md:top-[10%]">
      <p className={`text-white outline-4 phone:text-[80%] xs:text-[95%] sm:text-[90%] md:text-[100%] lg:text-[110%] xl:text-[120%] tracking-[0.2em] uppercase rotate-90 whitespace-nowrap origin-center`}
       style={{
        color: 'transparent',
        WebkitTextStroke: '1px white',
        textShadow: 'none'
      }}>
        &#34;NullPointerException.&#34;
      </p>
    </div>

    {/* Main Paragraph */}
    <div className="border-l-8 border-white flex-1 px-8 py-10 ml-[7%]">
      <p className="text-white font-para text-base phone:text-[80%] xs:text-lg md:text-xl lg:text-2xl xl:text-3xl" style={{ lineHeight: "1.8" }}>
        Participants are given runnable files that display input-output test cases. After deciphering the logic based on these input-output patterns, they need to come up with a code that will fulfil some hidden test cases. The fifteen best-performing teams of Round One advance to Round Two. Participants are given runnable files that display input-output test cases. After deciphering the logic based on these input-output patterns, they need to come up with a code that will fulfil some hidden test cases.
      </p>
    </div>
  </div>
</div>
</div>
   
 
  );
}
