import React from 'react';
// import Navbar from './Navbar';
import Image from 'next/image';
import image4 from "../../public/image4.svg";
 

const Disqualified = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0d0b17] text-white text-center overflow-hidden">
      <Image src={image4} alt="Centered SVG" className="w-1/3 h-auto" />
      <p className="text-4xl font-bold mt-6"  style={{ fontFamily: 'Death Star, sans-serif' }}>
      Expelled, you have been.
      </p>
     
    </div>
  );
};

export default Disqualified;
