"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import faqbg from "../../../../public/landing_new/faqbg.png"
import SmoothInfiniteScroll from "./infinitescroll"

const FaqMobile: React.FC = () => {
  const [activeBox, setActiveBox] = useState<number | null>(null)

  const contentBoxes = [
    {
      defaultText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do Lorem ipsum dolor sit amet",
      alternateText: "May the Force flow through your code like a mighty stream",
    },
    {
      defaultText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do",
      alternateText: "Debug or debug not, there is no try-catch",
    },
    {
      defaultText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do Lorem ipsum dolor sit amet",
      alternateText: "In the matrix of possibilities, a solution always exists",
    },
    {
      defaultText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do",
      alternateText: "The path to wisdom requires patience, young programmer",
    },
    {
      defaultText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do Lorem ",
      alternateText: "When code breaks, breathe deep and let clarity guide you",
    },
    {
      defaultText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do Lorem ipsum ",
      alternateText: "Trust in the Force, but validate your inputs you must",
    },
  ]

  const handleBoxClick = (index: number) => {
    setActiveBox(activeBox === index ? null : index)
  }

  return (
    <div className="relative w-full min-h-screen bg-black overflow-y-auto">
      <div
        className="hidden sm:flex absolute left-2 top-4 h-full flex items-center z-20"
        style={{
          writingMode: "vertical-lr",
          fontFamily: "Death Star, sans-serif",
          color: "transparent",
          WebkitTextStroke: "1px rgba(255, 255, 255, 1)",
        }}
      >
        <span className="transform text-glow how-it-works-heading rotate-180 text-xl xs:text-2xl sm:text-3xl md:text-4xl tracking-wider">
          ASK YOU MUST
        </span>
      </div>

      <div
        className="hidden sm:flex absolute right-2 bottom-4 flex items-center z-20"
        style={{
          writingMode: "vertical-rl",
          fontFamily: "Death Star, sans-serif",
          color: "transparent",
          WebkitTextStroke: "1px rgba(255, 255, 255, 1)",
        }}
      >
        <span className="transform text-glow how-it-works-heading rotate-180 text-xl xs:text-2xl sm:text-3xl md:text-4xl tracking-wider">
          ANSWER WE WILL
        </span>
      </div>

      <Image src={faqbg || "/placeholder.svg"} alt="bg" layout="fill" objectFit="cover" className="z-0" />

      <div className="flex flex-col relative z-10 min-h-screen">
        <div className="flex how-it-works-heading text-white justify-center pt-8 text-3xl pb-2 phone:text-8xl xs-sm:text-8xl xs:text-7xl sm:text-7xl md:text-7xl text-center">
          HOLO GUIDE
        </div>

        {/* Scrollable container */}
        <div
            className="flex-1 overflow-y-auto xs-sm:max-h-[60vh] phone:max-h-[55vh] relative z-20"
            style={{
                maskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
            }}
            >
            <div className="min-h-full flex items-center justify-center px-2 phone:px-8 xs:px-12 sm:px-16 md:px-20 py-8">
                <div className="w-full max-w-7xl">
                {/* Grid container */}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 phone:gap-6 xs:gap-6 sm:gap-6 md:gap-8">
                    {contentBoxes.map((box, index) => (
                    <div
                        key={index}
                        className={`bg-[#222222] backdrop-blur bg-opacity-80 p-3 phone:p-6 xs:p-4 font-outfit rounded text-white border border-[#9B51E0] border-opacity-50 transition-all duration-200 ease-in-out cursor-pointer text-xs phone:text-base xs:text-sm sm:text-sm md:text-sm
                        ${activeBox === index ? "bg-[#424242] shadow-[0_0_6px_rgba(255,255,255,1),0_0_15px_rgba(206,183,255,0.6),0_0_25px_rgba(155,81,224,0.7)]" : ""}`}
                        onClick={() => handleBoxClick(index)}
                    >
                        <span>{activeBox === index ? box.alternateText : box.defaultText}</span>
                    </div>
                    ))}
                </div>
                </div>
            </div>
        </div>

        <div className="block sm:hidden absolute bottom-[5vh] xs-sm:bottom-[7vh] w-[120vw] left-[-10vw] z-10 rotate-[-10deg] overflow-hidden">
          <SmoothInfiniteScroll text="TRY YOU MUST &nbsp; TRY YOU MUST" speed={1.6} />
          <SmoothInfiniteScroll text="UNTIL THE TASK IS DONE &nbsp; UNTIL THE TASK IS DONE" speed={1.4} />
        </div>
      </div>
    </div>
  )
}

export default FaqMobile

