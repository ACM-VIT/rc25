import React from 'react';
import Footer from './footer';
import Image from 'next/image';
import elimination from "@/app/assets/elimination.png";

const EliminationScreen = () => {
  return (
      <div className="flex flex-row items-center justify-center text-left mb-10 mt-20">
        <Image src={elimination} alt="Eliminated" width={300} height={400} className="mr-10" />
        <p className="font-bold text-white text-7xl max-w-xl">
          Fair attempt, Better Luck Next Time!
        </p>
      <Footer />
      </div>
  );
};

export default EliminationScreen;
