"use client";

import React from "react";

const SecondPage: React.FC = () => {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat p-3"
      style={{ backgroundImage: 'url("/dashbg.png")' }}
    >
      <div className="grid grid-cols-2 gap-2 text-white">
        <div className="flex flex-col justify-center items-center bg-[#1a1a2e]/70  p-6 rounded-lg h-[90vh] text-center">
          <h1 className="text-5xl m-2 font-['Orbitron']">SPONSORED BY</h1>
          <img src="/sponsor.svg" alt="Sponsor Logo" />
        </div>
        <div className="flex flex-col justify-center items-center bg-[#1a1a2e]/70  p-6 rounded-lg h-[90vh] text-center">
          <h1 className="text-5xl m-2 font-['Orbitron']">EXECUTED BY</h1>
          <h1 className="text-9xl font-['Orbitron']">JUDGE0</h1>
        </div>
      </div>
    </div>
  );
};

export default SecondPage;
