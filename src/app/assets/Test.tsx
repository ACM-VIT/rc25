
import React from "react";
import Image from "next/legacy/image";


const Test: React.FC = () => {
  return (
    <div className="relative w-full h-auto">
      <Image 
        src="src\app\assets\NullPointBackground.png"
        alt="Null Point Background"
        width={1920} 
        height={1080} 
        className="w-full h-auto" 
      />
    </div>
  );
};

export default Test;