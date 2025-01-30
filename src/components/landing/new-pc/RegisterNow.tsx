"use client";

import type React from "react";
import Image from "next/image";
import RC from "../../../../public/ReverseCoding.svg";
import logo from "../../../../public/acmlogo.svg";
import v1 from "../../../../public/Vector.png";
import v2 from "../../../../public/Vector(1).png";
import v3 from "../../../../public/Vector(2).png";

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

      <div className="absolute inset-0 z-30 flex flex-col h-full justify-center m-8 items-start gap-10">
        {[
          { src: v1, href: "/link1" },
          { src: v2, href: "/link2" },
          { src: v3, href: "/link3" },
        ].map((item, index) => (
          <a
            key={`vector-${index}`}
            href={item.href}
            className="transition-transform hover:scale-110"
          >
            <Image
              alt={`Vector icon ${index + 1}`}
              src={item.src || "/placeholder.svg"}
              width={48}
              height={48}
              className="transform"
              priority
            />
          </a>
        ))}
      </div>

      <div className="relative z-20 flex flex-col h-full w-full items-center justify-between">
        <div className="h-4/5 flex flex-col justify-center items-center">
          <h1 className="text-white text-9xl text-center sm:text-[75px] md:text-[100px] lg:text-[150px] xl:text-[250spx] tracking-widest how-it-works-heading">
            REGISTER
          </h1>
          <h1 className="text-9xl font-bold text-center bg-gradient-to-b from-white to-transparent text-transparent bg-clip-text sm:text-[75px] md:text-[100px] lg:text-[150px] xl:text-[250spx] tracking-widest how-it-works-heading">
            NOW
          </h1>
        </div>
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
