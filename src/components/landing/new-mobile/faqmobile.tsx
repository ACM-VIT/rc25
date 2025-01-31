"use client";

import type React from "react";
import { useState } from "react";
import Image from "next/image";
import faqbg from "../../../../public/landing_new/faqbg.png";
import SmoothInfiniteScroll from "./infinitescroll";

const FaqMobile: React.FC = () => {
  const [activeBox, setActiveBox] = useState<number | null>(null);

  const contentBoxes = [
    {
      defaultText:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do Lorem ipsum dolor sit amet",
      alternateText:
        "May the Force flow through your code like a mighty stream",
    },
    {
      defaultText:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do",
      alternateText: "Debug or debug not, there is no try-catch",
    },
    {
      defaultText:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do Lorem ipsum dolor sit amet",
      alternateText: "In the matrix of possibilities, a solution always exists",
    },
    {
      defaultText:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do",
      alternateText: "The path to wisdom requires patience, young programmer",
    },
    {
      defaultText:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do Lorem ",
      alternateText: "When code breaks, breathe deep and let clarity guide you",
    },
    {
      defaultText:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do Lorem ipsum ",
      alternateText: "Trust in the Force, but validate your inputs you must",
    },
  ];

  const handleBoxClick = (index: number) => {
    setActiveBox(activeBox === index ? null : index);
  };

  return (
    <div className=" inset-0 w-screen h-screen bg-black overflow-hidden">
      {/* Background image */}
      <Image
        src={faqbg || "/placeholder.svg"}
        alt="bg"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 z-0"
      />

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Title */}
        <div className="flex how-it-works-heading text-white justify-center pt-8 text-3xl pb-2 phone:text-8xl xs-sm:text-8xl xs:text-7xl sm:text-7xl md:text-7xl text-center">
          HOLO GUIDE
        </div>

        {/* Content container */}
        <div className="flex-1 flex items-center justify-center px-2 phone:px-8 xs:px-12 sm:px-16 md:px-20 h-[60v]">
          <div className="w-full max-w-7xl">
            {/* Grid container */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 phone:gap-6 xs:gap-6 sm:gap-6 md:gap-8">
              {contentBoxes.map((box, index) => (
                <div
                  key={index}
                  className={`bg-[#222222] backdrop-blur bg-opacity-80 p-3 phone:p-6 xs:p-4 font-outfit rounded text-white border border-[#9B51E0] border-opacity-50 transition-all duration-200 ease-in-out cursor-pointer text-xs phone:text-base xs:text-sm sm:text-sm md:text-sm
                        ${
                          activeBox === index
                            ? "bg-[#424242] shadow-[0_0_6px_rgba(255,255,255,1),0_0_15px_rgba(206,183,255,0.6),0_0_25px_rgba(155,81,224,0.7)]"
                            : ""
                        }`}
                  onClick={() => handleBoxClick(index)}
                >
                  <span>
                    {activeBox === index ? box.alternateText : box.defaultText}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Smooth Infinite Scroll */}
        <div className="absolute bottom-12 w-full z-20 rotate-[-10deg]">
          <SmoothInfiniteScroll
            text="TRY YOU MUST &nbsp; TRY YOU MUST"
            speed={0.5}
          />
          <SmoothInfiniteScroll
            text="UNTIL THE TASK IS DONE &nbsp; UNTIL THE TASK IS DONE"
            speed={0.6}
          />
        </div>
      </div>
    </div>
  );
};

export default FaqMobile;
