"use client";
import React from "react";
import Image from "next/legacy/image";
import bg from "@/app/assets/bgally.svg";
import upper from "@/app/assets/upperbracket.svg";
import lower from "@/app/assets/lowerbracket.svg";
import judge0 from "../../../../public/judge0.svg";
import easeMyTrip from "../../../../public/easemytrip.svg";

// Reusable clickable component

export default function Allies() {
    return (
        <div className="relative w-screen h-screen overflow-hidden">
            {/* Background Image */}
            <Image
                src={bg}
                alt="bg"
                layout="fill"
                objectFit="cover"
                className="z-0"
            />

            {/* Title */}
            <div className="absolute w-full text-center z-10">
                <h1 className="text-white lg:text-[80px] xl:text-[115px] how-it-works-heading uppercase">
                    Allies
                </h1>
            </div>

            {/* Clickable Areas Container */}
            <div className="flex flex-row justify-center items-center h-full w-full gap-x-16 lg:gap-x-32 xl:gap-x-48 flex-wrap">
                {/* First Image Container */}
                <a href="https://judge0.com/" target="_blank" rel="noreferrer">
                    <div className="relative flex flex-row items-center justify-center text-white transition-transform duration-200 mx-6 my-4 cursor-pointer hover:scale-[1.05]">
                        {/* Top bracket */}
                        <div className="absolute -top-10 -left-10 md:-top-12 md:-left-12 lg:-top-14 lg:-left-14">
                            <Image
                                src={upper}
                                alt="upper bracket"
                                width={40}
                                height={40}
                                className="w-[35px] h-[35px] md:w-[40px] md:h-[40px] lg:w-[45px] lg:h-[45px] xl:w-[50px] xl:h-[50px] scale-125"
                            />
                        </div>

                        {/* Main Image */}
                        <Image
                            src={judge0}
                            alt="Judge0"
                            width={350}
                            height={350}
                            className="p-3 w-auto max-w-full h-auto md:w-[300px] lg:w-[350px] xl:w-[400px]"
                        />

                        {/* Bottom bracket */}
                        <div className="absolute -bottom-10 -right-10 md:-bottom-12 md:-right-12 lg:-bottom-14 lg:-right-14">
                            <Image
                                src={lower}
                                alt="lower bracket"
                                width={40}
                                height={40}
                                className="w-[35px] h-[35px] md:w-[40px] md:h-[40px] lg:w-[45px] lg:h-[45px] xl:w-[50px] xl:h-[50px] scale-125"
                            />
                        </div>
                    </div>
                </a>
                {/* Second Image Container */}
                <a
                    href="https://www.easemytrip.com/"
                    target="_blank"
                    rel="noreferrer"
                >
                    <div className="relative flex flex-row items-center justify-center text-white transition-transform ursor-pointer hover:scale-[1.05] duration-200 mx-6 my-4">
                        {/* Top bracket */}

                        <div className="absolute -top-6 -left-10 md:-top-6 md:-left-12 lg:-top-6 lg:-left-14">
                            <Image
                                src={upper}
                                alt="upper bracket"
                                width={40}
                                height={40}
                                className="w-[35px] h-[35px] md:w-[40px] md:h-[40px] lg:w-[45px] lg:h-[45px] xl:w-[50px] xl:h-[50px] scale-125"
                            />
                        </div>

                        {/* Main Image */}
                        <Image
                            src={easeMyTrip}
                            alt="EaseMyTrip"
                            width={350}
                            height={350}
                            className="p-3 w-auto max-w-full h-auto md:w-[300px] lg:w-[350px] xl:w-[400px]"
                        />

                        {/* Bottom bracket */}
                        <div className="absolute -bottom-6 -right-10 md:-bottom-6 md:-right-12 lg:-bottom-6 lg:-right-14">
                            <Image
                                src={lower}
                                alt="lower bracket"
                                width={40}
                                height={40}
                                className="w-[35px] h-[35px] md:w-[40px] md:h-[40px] lg:w-[45px] lg:h-[45px] xl:w-[50px] xl:h-[50px] scale-125"
                            />
                        </div>
                    </div>
                </a>
            </div>

            {/* Vertical Scrolling Right Text */}
            <div className="absolute right-2 lg:right-8 top-0 h-full flex items-stretch z-10 py-8 overflow-hidden">
                <div
                    className="text-white text-lg sm:text-xl md:text-[2.3rem] lg:text-[2.4rem] font-aurebesh tracking-[0.2em] uppercase flex-1 flex items-center justify-center whitespace-nowrap animate-vertical-scroll"
                    style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                        WebkitTextStroke: "2px white",
                        color: "transparent",
                        textShadow:
                            "0 0 10px rgba(128, 0, 128, 0.8), 0 0 20px rgba(128, 0, 128, 0.6)", // Purple glow
                    }}
                >
                    CODE, INVERT, CONQUER
                </div>
            </div>
        </div>
    );
}
