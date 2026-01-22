"use client";

import React from "react";
import Image from "next/legacy/image";

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
        {/* Left column remains unchanged */}
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

        <div className="flex flex-col justify-center items-center bg-[#1a1a2e]/70 p-6 rounded-lg h-[90vh] text-center">
          <p className="text-4xl text-white font-['Orbitron'] leading-relaxed tracking-wide">
            EaseMyTrip is one of India&apos;s largest online travel platforms. From hassle-free bookings for flights, hotels, holidays, trains, and cabs to providing you with the best experiences at unmatched prices, EaseMyTrip is your go-to travel partner, making every journey smooth, affordable, and unforgettable.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sponsor;
