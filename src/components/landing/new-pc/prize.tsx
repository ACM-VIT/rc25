import type React from "react";
import Image from "next/image";
import bg from "../../../../public/landing_new/prize_bg.png";
import upper from "@/app/assets/upperbracket.svg";
import lower from "@/app/assets/lowerbracket.svg";
const Prize: React.FC = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Image
        src={bg || "/placeholder.svg"}
        alt="bg"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />

      {/* Left Side Text - Positioned relative to viewport width */}
      <div className="absolute left-6 -top-[20px] translate-y-3/4 -translate-x-1/2 transform z-10">
        <div className="vertical-text transform how-it-works-heading -rotate-90 text-glow font-extrabold text-[35px] sm:text-[20px] md:text-[30px] lg:text-[30px] xl:text-[45px] tracking-widest">
          Try
        </div>
      </div>

      {/* Right Side Text - Positioned relative to viewport width */}
      <div className="absolute right-6  translate-x-1/2 transform bottom-0 -translate-y-3/4 z-10">
        <div className="vertical-text transform how-it-works-heading -rotate-90 text-glow font-extrabold text-[35px] sm:text-[20px] md:text-[30px] lg:text-[30px] xl:text-[45px] tracking-widest">
          Catch
        </div>
      </div>

      {/* Main Heading - Centered and responsive */}
      <div className="absolute how-it-works-heading z-10 text-white text-center w-full text-[60px] sm:text-[80px] md:text-[110px] lg:text-[110px] xl:text-[160px]">
        Bounty Purse
      </div>

      {/* Main Content - Responsive positioning and spacing */}
      {/* <div className="absolute z-10 w-full h-full flex flex-row items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 pt-[20vh]"> */}
      {/* <div className="flex flex-row items-center justify-center">
          <Prizerock
            position="Best Freshers"
            prize={1224}
            height={180}
            width={180}
            positionTextSize="text-sm lg:text-md xl:text-xl -top-[25px]"
            prizeTextSize="text-sm lg:text-md xl:text-xl"
          />
          <Prizerock
            position="O(logn)"
            prize={1224}
            height={320}
            width={320}
            positionTextSize="text-3xl lg:text-4xl xl:text-5xl"
            prizeTextSize="text-3xl lg:text-4xl xl:text-5xl"
          />
          <Prizerock
            position="O(1)"
            prize={20000}
            height={400}
            width={400}
            positionTextSize="text-4xl lg:text-6xl"
            prizeTextSize="text-3xl lg:text-5xl"
          />
          <Prizerock
            position="O(n)"
            prize={1224}
            height={320}
            width={320}
            positionTextSize="text-3xl lg:text-4xl xl:text-5xl"
            prizeTextSize="text-3xl lg:text-4xl xl:text-5xl"
          />
        </div> */}
      <div className="h-full w-full flex flex-col items-center justify-center">
        <div className="relative flex flex-col items-center text-center justify-center h-[40vh] w-[50vw] text-white transform hover:scale-105 transition-transform duration-200 mx-6 my-4">
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
          <div className="flex flex-col items-center px-4 py-2 justify-center space-y-6 tracking-widest">
            <span
              className="text-base sm:text-lg md:text-xl lg:text-8xl font-custom"
              style={{
                textShadow: "0 0 5px rgba(255,255,255,0.7)",
                WebkitTextStroke: "0.5px white",
              }}
            >
              REDACTED
            </span>
            <span
              className="text-base sm:text-lg md:text-xl lg:text-2xl "
              style={{
                textShadow: "0 0 5px rgba(255,255,255,0.7)",
                WebkitTextStroke: "0.5px white",
              }}
            >
              The prize awaits, hidden in the far reaches of the galaxy... stay
              tuned, young Padawan.
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
            {/* </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prize;
