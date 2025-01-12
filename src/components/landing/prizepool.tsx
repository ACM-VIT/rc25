import React from 'react';
import { Audiowide } from 'next/font/google';

const audiowide = Audiowide({
    subsets: ['latin'], 
    weight: ['400'] ,
    display: 'swap',
  });

export default function PrizePool() {
    return(
    <div className="bg-black min-h-screen">
        <div className={`text-[10rem] flex ${audiowide.className} justify-center `}>
        PRIZE POOL
            </div> 
    </div>
    )

}