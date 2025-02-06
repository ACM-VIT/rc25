"use client";

import React from "react";
import Image from "next/image";

const Sponsor: React.FC = () => {
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
          <h1 className="text-5xl m-2 font-['Orbitron']">SPONSORED BY</h1>
          <Image
            src="/sponsor.svg"
            alt="Sponsor Logo"
            width={512}
            height={512}
            className="object-contain"
          />
        </div>

        <div className="flex flex-col justify-start items-start bg-[#1a1a2e]/70 p-6 rounded-lg h-[90vh] text-left">
          <p className="text-xl text-white font-['Orbitron'] leading-relaxed tracking-wide">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
            when an unknown printer took a galley of type and scrambled it to make a type specimen book.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sponsor;
