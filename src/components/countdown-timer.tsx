"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import bg from "@/app/assets/backgroundone.svg";
import { Orbitron } from "next/font/google";
import Board from "../../src/components/2048/index";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

interface CounterProps {
  getTimeUntil: string;
  roundNumber: number;
}

const Counter: React.FC<CounterProps> = ({ getTimeUntil, roundNumber }) => {
  const [timer, setTimer] = useState<string>("00:00:00");

  const getTimeRemaining = (end: string) => {
    const total = new Date(end).getTime() - new Date().getTime();
    if (total < 0) {
      return { total: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60) % 24);
    return { total, hours, minutes, seconds };
  };

  useEffect(() => {
    if (isNaN(Date.parse(getTimeUntil))) {
      console.error("Invalid date format for `getTimeUntil`:", getTimeUntil);
    }
    const updateTimer = () => {
      const timeRemaining = getTimeRemaining(getTimeUntil);
      setTimer(
        `${String(timeRemaining.hours).padStart(2, "0")}:${String(
          timeRemaining.minutes
        ).padStart(2, "0")}:${String(timeRemaining.seconds).padStart(2, "0")}`
      );
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [getTimeUntil, getTimeRemaining]); // Added getTimeRemaining to dependencies

  return (
    <div className="h-screen w-full">
      <div className="h-full w-full flex flex-col justify-between items-center overflow-hidden relative">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src={bg || "/placeholder.svg"}
            alt="background"
            fill
            className="object-cover object-center"
            priority
            style={{
              filter: "grayscale(50%) brightness(80%) contrast(90%)",
            }}
          />
        </div>

        {/* Title Section */}
        <div className="absolute top-4 sm:top-8 md:top-14 text-center text-white z-10 w-full px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl how-it-works-heading tracking-widest">
            WELCOME TO
          </h1>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl how-it-works-heading text-[#9850DB] mt-2">
            REVERSE CODING{" "}
            <span
              className="text-white"
              style={{
                color: "transparent",
                WebkitTextStroke: "1px #CEB7FF",
                textShadow: "none",
              }}
            >
              2025
            </span>
          </h2>
        </div>

        {/* Countdown Timer */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.06)",
            borderRadius: "6px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",
          }}
          className="flex flex-col items-center justify-center text-white text-base sm:text-lg tracking-widest w-[80%] sm:w-[60%] md:w-[50%] lg:w-[40%] xl:w-[30%] max-w-[300px] px-4 sm:px-6 py-3 sm:py-5 z-30 mt-32 sm:mt-40 md:mt-48 lg:mt-56 xl:mt-64 backdrop-blur bg-transparent"
        >
          <h1 className="text-sm sm:text-base md:text-lg lg:text-xl how-it-works-heading">
            <span className="text-[#F04D4E]">ROUND {roundNumber} </span>
            BEGINS IN
          </h1>

          <div
            className={`flex gap-2 text-lg sm:text-xl md:text-2xl lg:text-3xl mt-2 ${orbitron.className}`}
          >
            <span className="bg-[#FFFFFF20] px-2 py-1 rounded-md">
              {timer.slice(0, 2)}
            </span>
            <span>:</span>
            <span className="bg-[#FFFFFF20] px-2 py-1 rounded-md">
              {timer.slice(3, 5)}
            </span>
            <span>:</span>
            <span className="bg-[#FFFFFF20] px-2 py-1 rounded-md">
              {timer.slice(6, 8)}
            </span>
          </div>
        </div>

        {/* 2048 Game */}
        <div className="flex flex-col justify-center z-10 mb-8 scale-[0.9] ">
          <Board />
        </div>
      </div>
    </div>
  );
};

export default Counter;
