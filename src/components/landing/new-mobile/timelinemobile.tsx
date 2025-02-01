import type React from "react";
import Image from "next/image";
import timelinebg from "@/app/assets/timelinebg.svg";
import upper from "@/app/assets/upperbracket.svg";
import lower from "@/app/assets/lowerbracket.svg";
import SmoothInfiniteScroll from "./infinitescroll";

const timelineData = [
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

const TimeLineMobile: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <Image
        className="absolute top-0 left-0 w-full h-full object-cover"
        src={timelinebg || "/placeholder.svg"}
        alt="background"
        priority
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Fixed header */}
        <div className="pb-3">
          <div className="flex-none how-it-works-heading text-white justify-center pt-8 sm:pt-12 text-6xl xs:text-8xl phone:text-7xl xs-sm:text-8xl sm:text-8xl md:text-8xl lg:text-9xl text-center">
            TIMELINE
          </div>
        </div>

        {/* Scrollable container */}
        <div className="flex-1 overflow-y-hidden flex justify-center">
          <div className="px-4 py-6">
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-[65vh] overflow-auto no-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {timelineData.map((item, index) => (
                <div
                  key={index}
                  className="w-[50vw] relative group aspect-video bg-white/40 border border-[#CEB7FF] transition-all duration-300 ease-in-out hover:bg-white/20"
                >
                  <div className="absolute -top-2 -left-2">
                    <Image
                      src={upper || "/placeholder.svg"}
                      alt="upper bracket"
                      width={20}
                      height={20}
                    />
                  </div>

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-70 transition-all duration-100 ease-in-out bg-[#F2ECFF]/90 backdrop-blur-sm shadow-[0_0_20px_rgba(242,236,255,0.6)] group-hover:shadow-[0_0_30px_rgba(242,236,255,0.8)]" />

                  <div className="relative z-10 h-full flex flex-col items-center justify-center text-black p-4 text-center">
                    <div
                      className="text-xl mb-2"
                      style={{
                        fontFamily: "Audiowide, cursive",
                        ...textGlowStyle,
                      }}
                    >
                      {item.notation}
                    </div>
                    <div
                      className="text-lg"
                      style={{
                        fontFamily: "Audiowide, cursive",
                        ...textGlowStyle,
                      }}
                    >
                      {item.value}
                    </div>
                  </div>

                  <div className="absolute -bottom-2 -right-2">
                    <Image
                      src={lower || "/placeholder.svg"}
                      alt="lower bracket"
                      width={20}
                      height={20}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 w-full z-20 rotate-[-10deg]">
          <SmoothInfiniteScroll
            text="TRY YOU MUST &nbsp; TRY YOU MUST"
            speed={0.5}
          />
          <SmoothInfiniteScroll
            text="UNTIL THE TASK IS DONE &nbsp; UNTIL THE TASK IS DONE"
            speed={0.5}
          />
        </div>
      </div>
    </div>
  );
};

export default TimeLineMobile;
