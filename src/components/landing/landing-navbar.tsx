"use client";

import React from "react";
import Image from "next/image";
import RCLogo from "@/app/assets/RCLogo.svg";
import SignIn from "@/app/(auth)/authactions/signin";

const LandingNavbar: React.FC = () => {
    return (
        <nav
            className="pt-4 pb-4 sm:pt-6 sm:pb-6"
            style={{
                background: "transparent",
            }}
        >
            <div className="flex flex-wrap justify-between items-center mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
                <div className="flex-shrink-0">
                    <Image
                        src={RCLogo}
                        alt="ze rc logo"
                        className="w-[100px] sm:w-[150px] h-auto"
                    />
                </div>
                <ul className="flex flex-row gap-2 sm:gap-4 md:gap-6 list-none items-center mt-2 sm:mt-0">
                    <li>
                        <a
                            href="#"
                            className="block py-2 px-3 text-white font-bold text-sm sm:text-base hover:text-[#39234E] hover:underline"
                        >
                            FAQ
                        </a>
                    </li>
                    <li className="relative z-10 font-outfit">
                        <button
                            onClick={SignIn}
                            className="block px-4 py-2 w-[30vw] sm:w-[20vw] md:w-[15vw] bg-transparent hover:bg-[#9B51E0] hover:text-white rounded-full transition-all duration-300 ease-in-out text-sm sm:text-base"
                        >
                            <b>Sign In</b>
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default LandingNavbar;
