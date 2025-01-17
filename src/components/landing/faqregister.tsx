"use client";

import React from "react";
import Image from "next/image";
import { Audiowide } from "next/font/google";
import { Outfit } from "next/font/google";
import regrock from "@/app/assets/regrock.svg";
import yellowround from "@/app/assets/yellowround.svg";
import whiteround from "@/app/assets/whiteround.svg";
import Footer from "./footer";

const audiowide = Audiowide({
    subsets: ['latin'], 
    weight: ['400'],
    display: 'swap',
});

const outfit = Outfit({
    subsets: ['latin'], 
    weight: ['400'],
    display: 'swap',
});

export default function FaqRegister() {
  const faqItems = [
    {
      id: 1,
      question: "Lorem ipsum dolor sit amet",
      answer: "consectetur adipiscing elit, sed do"
    },
    {
      id: 2,
      question: "Lorem ipsum dolor sit amet",
      answer: "consectetur adipiscing elit, sed do consectetur adipiscing elit, sed do consectetur adipiscing elit, sed do consectetur adipiscing elit, sed do"
    },
    {
      id: 3,
      question: "Lorem ipsum dolor sit amet",
      answer: "consectetur adipiscing elit, sed do consectetur adipiscing elit, sed do consectetur adipiscing elit, sed do consectetur adipiscing elit, sed do"
    },
    {
      id: 4,
      question: "Lorem ipsum dolor sit amet",
      answer: "consectetur adipiscing elit, sed do"
    },
    {
      id: 5,
      question: "Lorem ipsum dolor sit amet",
      answer: "consectetur adipiscing elit, sed do"
    },
    {
      id: 6,
      question: "Lorem ipsum dolor sit amet",
      answer: "consectetur adipiscing elit, sed do Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative w-full flex flex-col  overflow-hidden" id="faq">
      {/* Main content */}
      <div className="flex-grow pt-10">
        <div className="flex flex-col">
          {/* FAQ Title */}
          <div className="flex justify-start pl-10 lg:pl-14 md:pl-10 sm:pl-8 xs:pl-8 phone:pl-6">
            <div className={`bg-gradient-to-b from-[#F0F1FA] to-[#ACADB5] bg-clip-text text-transparent text-center phone:text-[4rem] xs:text-[6rem] sm:text-[8rem] md:text-[9rem] lg:text-[10rem] ${audiowide.className}`}>
              FAQ
            </div>
          </div>

          {/* FAQ Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-28 gap-y-12 lg:gap-x-28 lg:gap-y-16 lg:px-28 md:gap-x-16 md:gap-y-8 md:px-16 p-10 sm:px-16 sm:gap-y-8 xs:px-12 xs:gap-8 phone:px-8 phone:gap-4 phone:p-4 z-[5]">
            {faqItems.map((item, _) => (
              <div
                key={item.id}
                className="relative group motion-opacity-in-0 motion-translate-y-in-100 motion-blur-in-md motion-duration-700" 
              >
                <div className="absolute inset-0 bg-[#222222] bg-opacity-80 rounded-lg border-1 border-[rgba(155,81,224,0.5)]" />
                <div className="relative rounded-lg p-6">
                  <h3 className={`text-xl phone:text-base ${outfit.className}`}>
                      {item.question}
                  </h3>
                  <p className={`text-gray-400 text-lg phone:text-sm mt-2 ${outfit.className}`}>
                      {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center lg:pt-48 lg:pb-36 md:pt-36 md:pb-32 sm:pt-32 sm:pb-28 xs:pt-28 xs:pb-24 phone:pt-28 phone:pb-28">
              <div
                  className={`bg-gradient-to-b from-[rgba(254,254,254,1)] to-[rgba(254,254,254,0.2)] bg-clip-text text-transparent text-center phone:text-[3rem] xs:text-[4rem] sm:text-[5rem] md:text-[6rem] lg:text-[10rem] ${audiowide.className} leading-[1] max-w-full overflow-hidden`}
              >
                  REGISTER<br />NOW
              </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute lg:right-[-90%] xl:right-[-65%] md:right-[-95%] bottom-0 z-[2] animate-spin-slow">
        <Image
          className="hidden md:block h-auto xl:max-h-[500%] lg:max-h-[350%] md:max-h-[700px]"
          src={yellowround}
          alt="Yellow Circle"
        />
      </div>

      <div className="absolute xl:right-[-76%] lg:right-[-80%] md:right-[-105%] bottom-0 z-[1] animate-spin-slow">
        <Image
          className="hidden md:block h-auto xl:max-h-[1200px] lg:max-h-[850px] md:max-h-[800px]"
          src={whiteround}
          alt="White Circle"
        />
      </div>

      <div className="absolute justify-start bottom-0 z-[0]">
        <Image
          className="hidden md:block h-auto max-h-[80vh]"
          src={regrock}
          alt="Register Rock"
        />
      </div>

      {/* Footer */}
      <div className="relative z-[3] mt-auto">
        <Footer />
      </div>
    </div>
  );
}