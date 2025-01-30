import type React from "react"
import Image from "next/image"
import timelinebg from "@/app/assets/timelinebg.svg"
import upper from "@/app/assets/upperbracket.svg"
import lower from "@/app/assets/lowerbracket.svg"

const timelineData = [
  { notation: "8:00am", value: "Start" },
  { notation: "9:00am", value: "Breakfast" },
  { notation: "10:00am", value: "Nap"},
  { notation: "11:00am", value: "Snack"},
  { notation: "12:00pm", value: "Lunch" },
  { notation: "1:00pm", value: "Nap" },
]

const textGlowStyle = {
  textShadow: "0 0 1px #CEB7FF, 0 0 4px #CEB7FF",
}

const TimeLineMobile: React.FC = () => {
  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* Side text - hidden on mobile/small screens */}
      <div 
        className="hidden md:flex absolute left-4 top-4 h-full items-center z-20"
        style={{ 
          writingMode: 'vertical-lr', 
          fontFamily: "Death Star, sans-serif",
          color: 'transparent',
          WebkitTextStroke: '1px rgba(255, 255, 255, 1)',
        }}
      >
        <span className="transform text-glow how-it-works-heading rotate-180 text-4xl tracking-wider">
          TRY YOU MUST
        </span>
      </div>

      <div 
        className="hidden md:flex absolute right-4 bottom-4 items-center z-20"
        style={{ 
          writingMode: 'vertical-rl', 
          fontFamily: "Death Star, sans-serif",
          color: 'transparent',
          WebkitTextStroke: '1px rgba(255, 255, 255, 1)',
        }}
      >
        <span className="transform text-glow how-it-works-heading rotate-180 text-4xl tracking-wider">
          UNTIL THE TASK IS DONE.
        </span>
      </div>

      <Image
        className="absolute top-0 left-0 w-full h-full object-cover"
        src={timelinebg || "/placeholder.svg"}
        alt="background"
        layout="fill"
      />

      <div className="flex flex-col relative z-10 h-full">
        <div className="flex how-it-works-heading text-white justify-center pt-8 sm:pt-12 text-6xl xs:text-8xl phone:text-7xl xs-sm:text-8xl sm:text-8xl md:text-8xl  lg:text-9xl text-center">
          TIMELINE
        </div>

        {/* Container with max-width and centered */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-20 md:px-24 xs:px-36 phone:px-20 xs-sm:px-32 lg:px-16 py-8">
          <div className="w-full max-w-7xl">
            {/* Grid container with responsive layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10 md:gap-10">
              {timelineData.map((item, index) => (
                <div
                  key={index}
                  className={`relative group aspect-video sm:aspect-auto min-h-[60px] 
                            bg-white/40 border border-[#CEB7FF]
                            transition-all duration-300 ease-in-out
                            hover:bg-white/20`}
                >
                  <div className="absolute -top-3 -left-3">
                    <Image
                      src={upper}
                      alt="upper bracket"
                      width={40}
                      height={40}
                      className="w-[20px] h-[20px] lg:w-[25px] lg:h-[25px] phone:w-[15px] phone:h-[15px]"
                    />
                  </div>

                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-70
                        transition-all duration-100 ease-in-out
                        bg-[#F2ECFF]/90 backdrop-blur-sm
                        shadow-[0_0_20px_rgba(242,236,255,0.6)]
                        group-hover:shadow-[0_0_30px_rgba(242,236,255,0.8)]`}
                  />

                  <div className="relative z-10 h-full flex flex-col items-center justify-center text-black p-4 text-center">
                    <div
                      className="text-xl sm:text-2xl phone:text-xl mb-2"
                      style={{ fontFamily: "Audiowide, cursive", ...textGlowStyle }}
                    >
                      {item.notation}
                    </div>
                    <div 
                      className="text-lg sm:text-xl phone:text-base" 
                      style={{ fontFamily: "Audiowide, cursive", ...textGlowStyle }}
                    >
                      {item.value}
                    </div>
                  </div>

                  <div className="absolute -bottom-3 -right-3">
                    <Image
                      src={lower}
                      alt="lower bracket"
                      width={40}
                      height={40}
                      className="w-[20px] h-[20px] lg:w-[25px] lg:h-[25px] phone:w-[15px] phone:h-[15px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimeLineMobile