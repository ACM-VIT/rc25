"use client";

import React from "react";
import Image from "next/image";

const DuoSponsor: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full p-3">
      <Image
        src="/dashbg.png"
        alt="Dashboard Background"
        fill
        className="object-cover"
        priority
      />
      
      <div className="relative z-10 grid grid-cols-2 gap-2 text-white">
        <div className="flex flex-col justify-center items-center bg-[#1a1a2e]/70 p-6 rounded-lg h-[90vh] text-center">
          <h1 className="text-5xl m-2 font-['Orbitron'] mb-6">SPONSORED BY</h1>
          <Image
            src="/sponsor.svg"
            alt="Sponsor Logo"
            width={512}
            height={512}
            className="object-contain"
          />
        </div>
        <div className="flex flex-col justify-center items-center bg-[#1a1a2e]/70 p-6 rounded-lg h-[90vh] text-center">
          <h1 className="text-5xl m-2 font-['Orbitron'] mb-6">EXECUTED BY</h1>
          <Image
            src="/judge0.svg"
            alt="Judge0 Logo"
            width={512}
            height={512}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default DuoSponsor;
