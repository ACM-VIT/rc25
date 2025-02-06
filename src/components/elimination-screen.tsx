import React from 'react';
 
import Image from 'next/image';

import ButThe from "../../public/butthe.svg"; 

const MemeDisplay: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0d0b17] text-white text-center overflow-hidden">
      <Image src={ButThe} alt="Centered SVG" className="w-1/3 lg:1/3 h-auto" />
      <p className="text-3xl lg:text-5xl font-bold mt-6 deathstar tracking-wider" >
        NEXT TIME, LUCK BETTER IT MAY BE, HMMM?
      </p>
       
    </div>
  );
};

export default MemeDisplay;
