"use client";

import React from "react";
import Image from "next/legacy/image";

const Sponsor2: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full p-3">
      <Image
        src="/dashbg.png"
        alt="Dashboard Background"
        fill
        className="object-cover"
        priority
      />

      <div className="relative z-10 grid grid-cols-2 gap-2 text-white mt-16">
        <div className="flex flex-col justify-center items-center bg-[#1a1a2e]/70 p-6 rounded-lg h-[90vh] text-center">
          <h1 className="text-5xl m-2 font-['Orbitron']">EXECUTED BY</h1>
          <Image
            src="/judge0.svg"
            alt="Judge0 Logo"
            width={512}
            height={512}
            className="object-contain"
          />
        </div>

        <div className="flex flex-col justify-center items-center bg-[#1a1a2e]/70 p-6 rounded-lg h-[90vh] text-center">
          <p className="text-4xl text-white font-['Orbitron'] leading-relaxed tracking-wide">
            Judge0, a leading provider of robust, scalable, open-source online code execution systems, was founded in 2016. With the motto &quot;Where Code Happens,&quot; Judge0 promotes unparalleled innovation by delivering efficient, reliable and highly scalable online code execution solutions for educational, competitive coding and various other platforms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sponsor2;
