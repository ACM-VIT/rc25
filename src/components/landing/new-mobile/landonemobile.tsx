import React from "react";
import Image from "next/image";
import backgroundone from "@/app/assets/backgroundone.svg";
import wrclogo from "@/app/assets/wrclogo.svg";
import acm from "@/app/assets/acm.svg";
import earthone from "@/app/assets/rounded_earth.svg";
import join from "@/app/assets/join.svg";
import SignIn from "@/app/(auth)/authactions/signin";
import scroll from "@/app/assets/scroll.svg";

function LandOneMobile() {
    return (
        <div className="h-screen w-full overflow-hidden">
            <div className="h-full w-full flex flex-col justify-between items-center relative">
                {/* Background image wrapper */}
                <div className="absolute inset-0 z-0 brightness-200">
                    <Image
                        src={backgroundone}
                        alt="background"
                        fill
                        className="object-cover object-left"
                        priority
                    />
                </div>

                {/* ACM Logo */}
                <div className="z-10 sm:w-[24%] xs:w-[30%] phone:w-[35%] justify-center items-center flex flex-col mt-[2%] animate-fadeIn">
                    <Image src={acm} alt="ACM" />
                </div>

                {/* RCLogo wrapper with Fade-In */}
                <div className="flex flex-col justify-center items-center z-10 sm:mb-[65%] md:mb-[55%] phone:mb-[120%] xs:mb-[85%] animate-fadeIn">
                    <Image
                        src={wrclogo}
                        alt="Reverse Coding"
                        className="md:w-100 sm:w-92 xs:w-[20rem] phone:w-[18rem]"
                    />
                    <div
                        className="2xl:text-[7rem] xl:text-[3.2rem] lg:text-[3rem] md:text-[2.8rem] sm:text-[2.4rem] xs:text-[2.1rem] phone:text-[1.7rem] mt-[2%] whitespace-nowrap justify-center items-center flex flex-col font-custom animate-fadeIn"
                        style={{
                            color: "transparent",
                            WebkitTextStroke: "1px white",
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

                {/* Join Button */}
                <button
                    className="sm:block absolute z-20 left-1/2 transform -translate-x-1/2
            md:w-[16rem] sm:w-[16rem] phone:w-[13rem] w-52
            md:bottom-[5%] sm:bottom-[5%] phone:bottom-[10%] xs:bottom-[10%] bottom-[0%]"
                    onClick={SignIn}
                >
                    <Image src={join} alt="Join" />
                </button>

                {/* Earth wrapper with controlled overflow and rotation */}
                <div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 
          sm:translate-y-1/2 xs:translate-y-[70%] phone:translate-y-[100%] 
          sm:scale-150 xs:scale-[2] phone:scale-[3] w-full md:mb-[-18%] phone:mb-[25%] sm:mb-[-8%]"
                >
                    <Image
                        src={earthone}
                        alt="Earth"
                        className="w-full h-auto animate-spin-slow"
                        width={1000}
                        height={1000}
                        priority
                    />
                </div>

                {/* Scroll Indicator - Larger & Positioned */}
                <div
                    className="absolute bottom-5 right-0 z-20 
            w-14 phone:w-[3rem] xs:w-[2.5rem] sm:w-12"
                >
                    <Image src={scroll} alt="Scroll" />
                </div>
            </div>
        </div>
    );
}

export default LandOneMobile;
