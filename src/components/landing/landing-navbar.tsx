"use client";

import type React from "react";
import Image from "next/image";
import Link from "next/link";
import RCLogo from "@/app/assets/RCLogo.svg";
import SignIn from "@/app/(auth)/authactions/signin";

const LandingNavbar: React.FC = () => {
  return (
    <nav
      className="pt-4 pb-4 sm:pt-6 sm:pb-6 lg:pt-8 lg:pb-8 w-full"
      style={{
        background: "transparent",
      }}
    >
      <div className="flex justify-between items-center w-full px-4 sm:px-6 md:px-8 lg:px-14 xl:px-20">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Image
            src={RCLogo}
            alt="ze rc logo"
            className="w-[100px] sm:w-[100px] md:w-[130px] lg:w-[160px] xl:w-[190px] 2xl:w[200px] 3xl:w[230px] 4xl:w[300px]h-auto"
          />
        </div>

        {/* Navigation Links */}
        <ul className="flex flex-row gap-2 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10 list-none items-center">
          <li>
            <Link
              href="#faq"
              className="block py-2 px-3 text-white font-bold text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl 3x:text-3xl 4xl:text-4xl hover:text-[#39234E] hover:underline"
            >
              FAQ
            </Link>
          </li>
          <li className="relative z-10 font-outfit">
            <button
              type="button"
              onClick={SignIn}
              className="block px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 xl:px-10 xl:py-5 xl:text-xl 2xl:text-2xl 3x:text-3xl 4xl:text-4xl bg-transparent hover:bg-[#9B51E0] hover:text-white rounded-full transition-all duration-300 ease-in-out text-sm sm:text-base lg:text-lg xl:text-xl"
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
