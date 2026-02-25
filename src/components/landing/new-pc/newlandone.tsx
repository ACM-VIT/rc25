import React from "react";
import Image from "next/image";
import backgroundone from "@/app/assets/backgroundone.svg";
import earthone from "@/app/assets/rounded_earth.svg";
import wrclogo from "@/app/assets/wrclogo.svg";
import acm from "@/app/assets/acm.svg";
import join from "@/app/assets/join.svg";
import SignIn from "@/app/(auth)/authactions/signin";

export default function NewLandOne() {
    return (
        <div className="h-screen w-full">
            {/* Main container with flex */}
            <div className="h-full w-full flex flex-col justify-between items-center overflow-hidden relative">
                {/* Background image wrapper */}
                <div className="inset-0 z-0">
                    <Image
                        src={backgroundone}
                        alt="background"
                        fill
                        className="object-cover object-center"
                        priority
                    />
                </div>

                {/* ACM Logo with Fade-In */}
                <div className="z-10 xl:w-[15%] lg:w-[20%] md:w-[24%] sm:w-[24%] xs:w-[30%] phone:w-[35%] justify-center items-center flex flex-col mt-[2%] animate-fadeIn">
                    <a
                        href="https://acmvit.in"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Image src={acm} alt="ACM" />
                    </a>
                </div>
                {/* RCLogo wrapper with Fade-In */}
                <div className="flex flex-col justify-center items-center z-10 phone:mt-[30%] xs:mt-[0%] sm:mt-[5%] md:mt-[0%] lg:mt-[0%] xl:mt-[0%] 2xl:mt-[3%] animate-fadeIn">
                    <Image
                        src={wrclogo}
                        alt="Reverse Coding"
                        className="2xl:w-120 xl:w-104 lg:w-104 md:w-100 sm:w-92 xs:w-[20rem] phone:w-[20rem]"
                    />
                    <div
                        className="2xl:text-[70px] xl:text-[60px] lg:text-[70px] md:text-[50px] sm:text-[2.4rem] xs:text-[2.1rem] phone:text-[1.7rem] mt-[2%] whitespace-nowrap justify-center items-center flex flex-col font-custom animate-fadeIn"
                        style={{
                            color: "transparent",
                            WebkitTextStroke: "1px #CEB7FF",
                            textShadow: "none",
                        }}
                    >
                        Code, Invert, Conquer
                    </div>
                    <div
                        className="text-center z-100 text-white font-custom font-bold text-[1rem] animate-fadeIn"
                        style={{
                            color: "transparent",
                            WebkitTextStroke: "0.5px #CEB7FF",
                            textShadow: "none",
                        }}
                    >
                        <p>07th February 2025 - 08:00 AM</p>
                        <p>Anna Auditorium</p>
                    </div>
                </div>

                {/* Left-Aligned Text: "TO REVERSE CODING" Ending at the Top */}
                <div className="absolute left-6 xl:top-[230px] lg:top-[200px] top-[200px] -translate-x-1/2 transform z-10">
                    <div className="vertical-text transform how-it-works-heading -rotate-90 text-glow font-extrabold text-[35px] sm:text-[20px] md:text-[30px] lg:text-[30px] xl:text-[45px] tracking-widest">
                        TO REVERSE CODING
                    </div>
                </div>

                <div className="absolute right-8 rotate-180 translate-x-1/2 transform xl:bottom-[160px] lg:bottom-[130px] bottom-[120px] -translate-y-3/4 z-10">
                    <div className="vertical-text transform how-it-works-heading rotate-90 text-glow font-extrabold text-[35px] sm:text-[20px] md:text-[30px] lg:text-[30px] xl:text-[45px] tracking-widest">
                        WELCOME YOU ARE
                    </div>
                </div>

                {/* Join button */}
                <button
                    className="absolute z-20 left-1/2 transform -translate-x-1/2
                      2xl:w-[20rem] xl:w-[18rem] lg:w-[18rem] md:w-[16rem] sm:w-56 xs:w-[12rem] w-40
                      2xl:bottom-[8%] xl:bottom-[5%] lg:bottom-[2%] md:bottom-[0%] sm:bottom-[5%] xs:bottom-[2%] bottom-[0%]"
                    onClick={SignIn}
                >
                    <Image src={join} alt="Join" />
                </button>

                {/* Earth image wrapper */}
                <div className="flex justify-center z-10">
                    <Image
                        src={earthone}
                        alt="earth"
                        className="-z-10 w-[150%] sm:w-[170%] md:w-[140%] lg:w-[150%] xl:w-full 
                       phone:mt-[10%] xs:mt-[20%] sm:mt-[-5%] md:mt-[-8%] lg:mt-[5%] xl:mt-[-2%] 2xl:mt-[-7%] animate-spin-slow"
                    />
                </div>
            </div>
        </div>
    );
}
