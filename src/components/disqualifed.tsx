import React from 'react';
import Navbar from './Navbar';
import Image from 'next/image';
import cheater from "@/app/assets/cheater.png";
import Footer from './footer';

const Disqualified = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <Image src={cheater} alt="Disqualified" width={300} height={400} className="mb-10 mt-10" />
      <p className="font-bold text-white text-5xl">Naughty cheaters don't get to play :)</p>
      <Footer/>
    </div>
  );
};

export default Disqualified;
