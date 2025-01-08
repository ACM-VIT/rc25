import React from 'react';
import Image from 'next/image';

export default function LandOne() {
  return (
    <div className="overflow-y-auto min-h-screen text-white flex items-center justify-center bg-black">
      
      <div className="absolute top-[100px] sm:top-[120px] md:top-[140px] w-full flex justify-center text-center z-[0] px-4 sm:px-8">
        <p className="text-base sm:text-base md:text-xl lg:text-2xl font-outfit leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do <br className="hidden sm:block" /> 
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
      
      <div className='overflow-y-hidden flex flex-row justify-between items-center bg-black text-white min-h-screen z-index:2'>
        <div className="hidden md:flex justify-start items-center w-3/9" style={{ transform: 'translateY(50px)' }}>
          <Image src="/leftrock.svg" alt="Left Rock" width={400} height={200} />
        </div>
        
        <div className="flex justify-center items-center w-4/9 md:w-4/27"  style={{ transform: 'translateY(-100px)' }}>
          <Image src="/revcod.svg" alt="Reverse Coding" width={600} height={200} />
        </div>

        <div className="hidden md:flex justify-end items-center w-2/9" style={{ transform: 'translateY(-100px)' }}>
          <Image src="/rightrock.svg" alt="Right Rock" width={400} height={200} />
        </div>
      </div>

    </div>
  );
}
