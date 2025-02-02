"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import bg from "@/app/assets/backgroundone.svg";
import earthone from "@/app/assets/rounded_earth.svg";
import { Orbitron } from "next/font/google";

const orbitron= Orbitron({
    subsets: ['latin'], 
    weight: ['400'] ,
    display: 'swap',
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
            return {
                total: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
            };
        }
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / 1000 / 60 / 60) % 24);
        return {
            total: total,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
        };
    };

    useEffect(() => {
        if (isNaN(Date.parse(getTimeUntil))) { 
            console.error("Invalid date format for `getTimeUntil`:", getTimeUntil);
        }
        const updateTimer = () => {
            const timeRemaining = getTimeRemaining(getTimeUntil);
            setTimer(
                `${String(timeRemaining.hours).padStart(2, "0")}:${String(timeRemaining.minutes).padStart(2, "0")}:${String(timeRemaining.seconds).padStart(2, "0")}`
            );
        };
        setTimer(
            `${getTimeRemaining(getTimeUntil).hours}:${getTimeRemaining(getTimeUntil).minutes}:${getTimeRemaining(getTimeUntil).seconds}`
        );
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [getTimeUntil]);

    return (
        <div className="h-screen w-full">
            {/* Main container */}
            <div className="h-full w-full flex flex-col justify-between items-center overflow-hidden relative">
                {/* Background */}
                <div className="inset-0 z-0">
                    <Image
                        src={bg}
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
                <div className="absolute top-14 text-center text-white z-10 ">
                    <h1 className="text-3xl sm:text-4xl md:text-6xl how-it-works-heading tracking-widest">
                        WELCOME TO
                    </h1>
                    <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl  how-it-works-heading text-[#9850DB]">
                        REVERSE CODING <span className="text-white" style={{
                            color: "transparent",
                            WebkitTextStroke: "1px #CEB7FF",
                            textShadow: "none",
                        }}>2025</span>
                    </h2>

                    {/* Countdown Timer */}
                   
            </div>
            <div  
    style={{
        background: "rgba(255, 255, 255, 0.06)", 
        borderRadius: "6px",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)", 
    }}
    className="flex flex-col items-center justify-center text-white text-lg md:text-sm tracking-widest w-[70%] xs:w-[50%] sm:w-[40%] md:max-w-[300px] px-6 py-5 z-30 md:translate-y-[200%] xs:translate-y-[200%] phone:translate-y-[250%] backdrop-blur bg-transparent" 
>
    <h1 className="text-sm md:text-md lg:text-lg how-it-works-heading">
        <span className="text-[#F04D4E]">ROUND {roundNumber} </span>
        BEGINS IN
    </h1>

    <div className={`flex gap-2 text-xl md:text-2xl lg:text-3xl mt-2 ${orbitron.className}`}>
        <span className="bg-[#FFFFFF20] px-2 py-1 rounded-md">{timer[0]}{timer[1]}</span>
        <span>:</span>
        <span className="bg-[#FFFFFF20] px-2 py-1 rounded-md">{timer[3]}{timer[4]}</span>
        <span>:</span>
        <span className="bg-[#FFFFFF20] px-2 py-1 rounded-md">{timer[6]}{timer[7]}</span>
    </div>
</div>

                {/* Rotating Earth */}
                <div className="flex justify-center z-10 scale-[200%] lg:translate-y-[5%]">
                    <Image
                        src={earthone}
                        alt="earth"
                        className="-z-10 w-[150%] sm:w-[170%] md:w-[140%] lg:w-[150%] xl:w-[100%] 
                                   phone:mt-[100%] xs:mt-[70%] sm:mt-[60%] md:mt-[50%] lg:mt-[40%] xl:mt-[40%] 2xl:mt-[40%] animate-spin-slow"
                                   style={{
                                    filter: "grayscale(50%) brightness(80%) contrast(90%)", 
                                }}
                                   
                    />
                </div>
            </div>
        </div>
    );
};

export default Counter;