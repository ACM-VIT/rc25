import type React from "react";
import Image from "next/image";
import bg from "../../../../public/landing_new/prize_bg.png";
import Prizerock from "./../new-pc/rock-prize";
import SmoothInfiniteScroll from "./infinitescroll";

const PriceMobile: React.FC = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Image
        src={bg || "/placeholder.svg"}
        alt="bg"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />

      {/* Main Heading */}
      <div className="absolute how-it-works-heading z-10 text-white text-center w-full text-7xl sm:text-[90px] xl:text-[160px]">
        Bounty Purse
      </div>

      {/* Prize Rocks for different breakpoints */}
      <div className="absolute z-10 w-full h-full flex flex-col  justify-center px-4 sm:px-8 md:px-16 lg:px-24 bottom-[2vh]">
        <div className="flex flex-col items-center justify-center">
          {/* Rocks for xs screens (up to 480px) */}
          <div className="flex flex-col items-center justify-center space-y-2 xs-sm:hidden">
            <Prizerock
              position="O(1)"
              prize={20000}
              height={80}
              width={90}
              positionTextSize="text-xl"
              prizeTextSize="text-base"
            />
            <Prizerock
              position="O(logn)"
              prize={1224}
              height={70}
              width={75}
              positionTextSize="text-lg"
              prizeTextSize="text-sm"
            />
            <Prizerock
              position="O(n)"
              prize={1224}
              height={70}
              width={75}
              positionTextSize="text-lg"
              prizeTextSize="text-sm"
            />
            <Prizerock
              position="Best Freshers"
              prize={1224}
              height={50}
              width={55}
              positionTextSize="text-xs"
              prizeTextSize="text-xs"
            />
          </div>

          {/* Rocks for xs-sm screens (410px - 480px) */}
          <div className="hidden xs-sm:flex sm:hidden flex-col items-center justify-center space-y-3">
            <Prizerock
              position="O(1)"
              prize={20000}
              height={160}
              width={170}
              positionTextSize="text-2xl"
              prizeTextSize="text-lg"
            />
            <Prizerock
              position="O(logn)"
              prize={1224}
              height={110}
              width={120}
              positionTextSize="text-lg"
              prizeTextSize="text-base"
            />
            <Prizerock
              position="O(n)"
              prize={1224}
              height={110}
              width={120}
              positionTextSize="text-lg"
              prizeTextSize="text-base"
            />
            <Prizerock
              position="Best Freshers"
              prize={1224}
              height={80}
              width={85}
              positionTextSize="text-sm"
              prizeTextSize="text-sm"
            />
          </div>

          {/* Rocks for sm screens (640px - 768px) */}
          <div className="hidden sm:flex md:hidden flex-col items-center justify-center space-y-4">
            <Prizerock
              position="O(1)"
              prize={20000}
              height={120}
              width={130}
              positionTextSize="text-3xl"
              prizeTextSize="text-xl"
            />
            <Prizerock
              position="O(logn)"
              prize={1224}
              height={100}
              width={105}
              positionTextSize="text-xl"
              prizeTextSize="text-lg"
            />
            <Prizerock
              position="O(n)"
              prize={1224}
              height={100}
              width={105}
              positionTextSize="text-xl"
              prizeTextSize="text-lg"
            />
            <Prizerock
              position="Best Freshers"
              prize={1224}
              height={70}
              width={75}
              positionTextSize="text-sm"
              prizeTextSize="text-sm"
            />
          </div>

          {/* Rocks for md and larger screens (768px and above) */}
          <div className="hidden md:flex flex-col items-center justify-center space-y-6">
            <Prizerock
              position="O(1)"
              prize={20000}
              height={161}
              width={170}
              positionTextSize="text-3xl lg:text-6xl"
              prizeTextSize="text-xl lg:text-5xl"
            />
            <Prizerock
              position="O(logn)"
              prize={1224}
              height={130}
              width={130}
              positionTextSize="text-2xl lg:text-4xl xl:text-5xl"
              prizeTextSize="text-lg lg:text-4xl xl:text-5xl"
            />
            <Prizerock
              position="O(n)"
              prize={1224}
              height={130}
              width={130}
              positionTextSize="text-2xl lg:text-4xl xl:text-5xl"
              prizeTextSize="text-lg lg:text-4xl xl:text-5xl"
            />
            <Prizerock
              position="Best Freshers"
              prize={1224}
              height={89}
              width={94}
              positionTextSize="text-sm lg:text-md xl:text-xl"
              prizeTextSize="text-sm lg:text-md xl:text-xl"
            />
          </div>
        </div>
      </div>

      {/* Infinite Scroll */}
      <div className="absolute bottom-[7vh] xs-sm:bottom-[10vh] sm:bottom-[11vh] w-full z-10 rotate-[-10deg]">
        <SmoothInfiniteScroll
          text="Try&nbsp;&nbsp;Try&nbsp;&nbsp;Try&nbsp;&nbsp;Try&nbsp;&nbsp;Try&nbsp;&nbsp;Try&nbsp;&nbsp;Try&nbsp;&nbsp;Try&nbsp;&nbsp;Try&nbsp;&nbsp;Try"
          speed={0.5}
        />
        <SmoothInfiniteScroll
          text="Catch&nbsp;&nbsp;Catch&nbsp;&nbsp;Catch&nbsp;&nbsp;Catch&nbsp;&nbsp;Catch&nbsp;&nbsp;Catch&nbsp;&nbsp;Catch&nbsp;&nbsp;Catch&nbsp;&nbsp;Catch&nbsp;&nbsp;Catch"
          speed={0.6}
        />
      </div>
    </div>
  );
};

export default PriceMobile;
