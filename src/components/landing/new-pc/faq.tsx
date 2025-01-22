import React from "react";
import Image from "next/image";
import faqbg from "../../../../public/landing_new/faqbg.png";

const Faq: React.FC = () => {
  const contentBoxes = [
    { 
      defaultText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do",
      hoverText: "May the Force flow through your code like a mighty stream" 
    },
    { 
      defaultText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do",
      hoverText: "Debug or debug not, there is no try-catch" 
    },
    { 
      defaultText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do",
      hoverText: "In the matrix of possibilities, a solution always exists" 
    },
    { 
      defaultText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do",
      hoverText: "The path to wisdom requires patience, young programmer" 
    },
    { 
      defaultText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do",
      hoverText: "When code breaks, breathe deep and let clarity guide you" 
    },
    { 
      defaultText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do",
      hoverText: "Trust in the Force, but validate your inputs you must" 
    },
  ];

  return (
    <div className="relative w-screen h-screen bg-black overflow-y-hidden">
      <div 
        className="absolute left-4 top-4 h-full flex items-center z-20"
        style={{ 
          writingMode: 'vertical-lr', 
          fontFamily: "Death Star, sans-serif",
          color: 'transparent',
          WebkitTextStroke: '1px rgba(255, 255, 255, 1)',
        }}
      >
        <span className="transform text-glow how-it-works-heading rotate-180 text-4xl lg:text-5xl tracking-wider">
          ASK YOU MUST
        </span>
      </div>

      <div 
        className="absolute right-4 bottom-4 flex items-center z-20"
        style={{ 
          writingMode: 'vertical-rl', 
          fontFamily: "Death Star, sans-serif",
          color: 'transparent',
          WebkitTextStroke: '1px rgba(255, 255, 255, 1)',
        }}
      >
        <span className="transform text-glow how-it-works-heading rotate-180 text-4xl lg:text-5xl tracking-wider">
          ANSWER WE WILL
        </span>
      </div>

      <Image
        src={faqbg || "/placeholder.svg"}
        alt="bg"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />

      <div className="flex flex-col relative z-10 h-full">
        <div className="flex how-it-works-heading text-white justify-center pt-8 sm:pt-12 md:pt-12 lg:pt-12 text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-center">
          HOLO-GUIDE
        </div>

        <div className="flex flex-col h-full justify-center items-center px-80 lg:px-48 md:px-28 sm:px-24 xs:px-20 py-16">
          <div className="grid grid-cols-2 gap-x-20 gap-y-8 xl:gap-x-20 xl:gap-y-8 md:gap-x-12 md:gap-y-4 sm:gap-x-8 sm:gap-y-4 xs:gap-4  mb-16">
            {contentBoxes.map((box, index) => (
              <div
                key={index}
                className="bg-[#222222] backdrop-blur bg-opacity-80 hover:bg-[#424242] hover:bg-opcaity-20 p-4 font-outfit rounded text-white border border-[#9B51E0] border-opacity-50 transition-all duration-200 ease-in-out hover:shadow-[0_0_6px_rgba(255,255,255,1),0_0_15px_rgba(206,183,255,0.6),0_0_25px_rgba(155,81,224,0.7)] group"
              >
                <span className="group-hover:hidden">{box.defaultText}</span>
                <span className="hidden group-hover:inline">{box.hoverText}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;