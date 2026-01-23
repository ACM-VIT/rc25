"use client";

import type React from "react";
import Image from "next/image";
import RC from "../../../../public/ReverseCoding.svg";
import logo from "../../../../public/acmlogo.svg";
import v1 from "../../../../public/Vector.svg";
import v2 from "../../../../public/Vector(1).svg";
import v3 from "../../../../public/Vector(2).svg";
import v5 from "../../../../public/Vector(3).svg";
import v7 from "../../../../public/Vector(4).svg";
import v8 from "../../../../public/Vector(5).svg";
import SignIn from "@/app/(auth)/authactions/signin";
const RegisterNow1: React.FC = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#1a1a2e]">
      <div className="absolute inset-0 z-10">
        <Image
          alt="background"
          src="/RegisterNow.png"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      <div className="absolute inset-0 z-40 flex flex-col h-full w-[20vw] justify-center  my-6 items-start gap-7 mt-[-1%]">
        <div className="flex  items-start">
          <p className="rotate-180 lg:text-[45px] xl:text-[45px] how-it-works-heading text-glow font-extrabold text-white/70 [writing-mode:vertical-lr] tracking-widest M-5">
            REACH US AT
          </p>
        </div>
        {[
          { src: v2, href: "https://github.com/ACM-VIT" },
          { src: v1, href: "https://www.instagram.com/acmvit/" },
          { src: v5, href: "https://www.linkedin.com/company/acmvit/" },
          { src: v3, href: "https://www.facebook.com/acmvitvellore/" },
          { src: v7, href: "https://x.com/ACM_VIT" },
          { src: v8, href: "https://blog.acmvit.in/" },
        ].map((item, index) => (
          <a
            key={`vector-${index}`}
            href={item.href}
            target="_blank"
            className="mx-4 transition-transform hover:scale-110"
          >
            <Image
              alt={`Vector icon ${index + 1}`}
              src={item.src}
              width={48}
              height={48}
              className=" scale-120 transform fix"
              priority
            />
          </a>
        ))}
      </div>

      <div className="relative z-30 flex flex-col h-full w-full items-center justify-between cursor-pointer">
        <button
          className="h-4/5 flex flex-col justify-center items-center"
          onClick={SignIn}
        >
          <h1 className="text-white text-9xl text-center sm:text-[75px] md:text-[100px] lg:text-[150px] xl:text-[250spx] tracking-widest how-it-works-heading">
            REGISTER
          </h1>
          <h1 className="text-9xl font-bold text-center bg-linear-to-b from-white to-transparent text-transparent bg-clip-text sm:text-[75px] md:text-[100px] lg:text-[150px] xl:text-[250spx] tracking-widest how-it-works-heading">
            NOW
          </h1>
        </button>
        <div className="flex h-1/5 w-full flex-row items-center justify-between">
          <div className="flex justify-center items-center w-1/4">
            <div className="w-full flex justify-end">
              <Image
                alt="ACM Logo"
                src={logo || "/placeholder.svg"}
                width={120}
                height={120}
                className="transform scale-150"
                priority
              />
            </div>
          </div>

          <div className="flex justify-center items-center w-1/4 mb-8">
            <div className="w-full flex justify-start">
              <Image
                alt="Reverse Coding Logo"
                src={RC || "/placeholder.svg"}
                width={120}
                height={120}
                className="transform scale-150"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterNow1;
