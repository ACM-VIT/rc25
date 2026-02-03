import React from 'react';
import Image from 'next/image';
import { formula1Wide, formula1Bold } from '@/lib/fonts';


const Disqualified = () => {
  return (
    <div className="fixed inset-0 flex flex-col bg-[#0C0C0C] text-white overflow-hidden">
      {/* Header with car and disqualified text */}
      <div className="w-full">
        <Image
          src="/disq-header.svg"
          alt="Disqualified Header"
          width={1418}
          height={122}
          className="w-full h-auto"
          priority
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Caution sign */}
        <div className="mb-8">
          <Image
            src="/caution.svg"
            alt="Caution Sign"
            width={400}
            height={380}
            className="w-64 h-auto md:w-80 lg:w-96"
          />
        </div>

        {/* Disqualified message */}
        <h1 className={`text-2xl md:text-4xl lg:text-5xl font-bold tracking-wide text-white uppercase ${formula1Bold.className}`}>
          YOU HAVE BEEN DISQUALIFIED
        </h1>
        <h2 className={`text-2xl md:text-4xl lg:text-5xl font-bold tracking-wide text-white uppercase mt-2 ${formula1Bold.className}`}>
          FROM THIS LAP
        </h2>
      </div>
    </div>
  );
};

export default Disqualified;
