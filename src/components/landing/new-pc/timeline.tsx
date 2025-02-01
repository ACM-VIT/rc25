import type React from "react";
import Image from "next/image";
import timelinebg from "@/app/assets/timelinebg.svg";
import upper from "@/app/assets/upperbracket.svg";
import lower from "@/app/assets/lowerbracket.svg";

const timelineData = [
  /* change datatatataata */
  { notation: "8:00am", value: "Start" },
  { notation: "9:00am", value: "Breakfast" },
  { notation: "10:00am", value: "Nap" },
  { notation: "11:00am", value: "Snack" },
  { notation: "12:00pm", value: "Lunch" },
  { notation: "1:00pm", value: "Nap" },
];

const textGlowStyle = {
  textShadow: "0 0 1px #CEB7FF, 0 0 4px #CEB7FF",
};

const TimeLine: React.FC = () => {
  return (
    <div className="relative w-screen h-screen bg-black overflow-y-hidden">
      <div
        className="absolute left-4 top-4 h-full flex items-center z-20"
        style={{
          writingMode: "vertical-lr",
          fontFamily: "Death Star, sans-serif",
          color: "transparent",
          WebkitTextStroke: "1px rgba(255, 255, 255, 1)", // White outline with 80% opacity
        }}
      >
        <span className="text-[35px] sm:text-[20px] md:text-[30px] lg:text-[30px] xl:text-[45px] transform text-glow how-it-works-heading rotate-180 text-4xl tracking-wider">
          TRY YOU MUST
        </span>
      </div>

      <div
        className="absolute right-4 bottom-4 flex items-center z-20"
        style={{
          writingMode: "vertical-rl",
          fontFamily: "Death Star, sans-serif",
          color: "transparent",
          WebkitTextStroke: "1px rgba(255, 255, 255, 1)", // White outline with 80% opacity
        }}
      >
        <span className=" text-[35px] sm:text-[20px] md:text-[30px] lg:text-[30px] xl:text-[45px] transform text-glow how-it-works-heading rotate-180 text-4xl  tracking-wider">
          UNTIL THE TASK IS DONE.
        </span>
      </div>

      <Image
        className="absolute top-0 left-0 w-full h-full object-cover"
        src={timelinebg || "/placeholder.svg"}
        alt="background"
        layout="fill"
      />

      <div className="flex flex-col relative z-10 h-full justify">
        <div className="flex how-it-works-heading text-white   justify-center pt-8 sm:pt-12 md:pt-12 lg:pt-12 text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-center">
          TIMELINE
        </div>

        <div className="flex h-full justify-center items-center gap-4 md:gap-8 px-28 lg:px-32">
          {timelineData.map((item, index) => (
            <div
              key={index}
              className={`relative group w-48 h-32 md:w-64 md:h-36 overflow-visible
                        bg-white/40 border
                        transition-all duration-300 ease-in-out
                        hover:bg-white/20
                        border-[#CEB7FF] `}
            >
              {/* Corner decorations */}
              {/* <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-[#CEB7FF]" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-[#CEB7FF]" />
 */}
              {/* Glow effect */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-70
                    transition-all duration-100 ease-in-out
                    bg-[#F2ECFF]/90 backdrop-blur-sm
                    shadow-[0_0_20px_rgba(242,236,255,0.6)]
                    group-hover:shadow-[0_0_30px_rgba(242,236,255,0.8)]`}
              />

              {/* top left bracket */}
              <div className="absolute -top-3 -left-3">
                <Image
                  src={upper}
                  alt="upper bracket"
                  width={40}
                  height={40}
                  className="md:w-[25px] md:h-[25px] lg:w-[25px] lg:h-[25px]"
                />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-black p-4 text-center">
                <div
                  className="text-2xl md:text-2xl mb-2"
                  style={{ fontFamily: "Audiowide, cursive", ...textGlowStyle }}
                >
                  {item.notation}
                </div>
                <div
                  className="text-xl md:text-xl"
                  style={{ fontFamily: "Audiowide, cursive", ...textGlowStyle }}
                >
                  {item.value}
                </div>
              </div>

              {/* bottom right bracket */}
              <div className="absolute -bottom-3 -right-3">
                <Image
                  src={lower}
                  alt="lower bracket"
                  width={40}
                  height={40}
                  className="md:w-[25px] md:h-[25px] lg:w-[25px] lg:h-[25px]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeLine;
