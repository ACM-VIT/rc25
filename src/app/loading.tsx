"use client";

import Lottie from "lottie-react"; // Updated library import
import animationData from "../../public/loading.json";

export default function Loading() {
  return (
    <div className="bg-black/80">
      <div className="flex justify-center items-center h-screen scale-[0.35] ">
        <Lottie
          animationData={animationData}
          loop
          autoplay
          height={90}
          width={90}
        />
      </div>
    </div>
  );
}
