"use client";

import React from "react";

const Sponsor2: React.FC = () => {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat p-3"
      style={{ backgroundImage: 'url("/dashbg.png")' }}
    >
      <div className="grid grid-cols-2 gap-2 text-white mt-16">
        <div className="flex flex-col justify-center items-center bg-[#1a1a2e]/70 p-6 rounded-lg h-[90vh] text-center">
          <h1 className="text-5xl m-2 font-['Orbitron']">SPONSORED BY</h1>
          <img src="/judge0.svg" alt="Sponsor Logo" />
        </div>

        <div className="flex flex-col justify-center items-center bg-[#1a1a2e]/70 p-6 rounded-lg h-[90vh] text-center">
          <p className="text-white text-center font-['Orbitron'] leading-relaxed tracking-wide">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
            when an unknown printer took a galley of type and scrambled it to make a type specimen book.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sponsor2;
