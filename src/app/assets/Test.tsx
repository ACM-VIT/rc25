
import React from "react";
import Image from "next/image";


const Test: React.FC = () => {
  return (
    <div className="relative w-full h-auto">
      <Image 
        src="https://rc25-assets.acmvit.in/NullPointBackground.png"
        alt="Null Point Background"
        width={1920} 
        height={1080} 
        className="w-full h-auto" 
      />
    </div>
  );
};

export default Test;