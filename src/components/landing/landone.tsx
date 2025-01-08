import React from 'react';
import Image from 'next/image';

export default function LandOne() {
  return (
    <div className="overflow-y-auto min-h-screen text-white flex items-center justify-center bg-black">
      {/* Left rock */}
      <div className="absolute left-0 top-[450px] transform -translate-y-1/2">
        <Image src="/leftrock.svg" alt="Left Rock" width={400} height={200} />
      </div>

      <div className="absolute top-[90px] text-center">
        <p className="text-3xl font-outfit">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do <br></br>eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
      
      <div className="absolute top-[180px]">
        <Image src="/revcod.svg" alt="Reverse Coding" width={600} height={200} />
      </div>

      <div className="absolute right-0 top-[250px] transform -translate-y-1/2">
        <Image src="/rightrock.svg" alt="Right Rock" width={400} height={200} />
      </div>

    </div>
  );
}
