"use client";

import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => <div className="h-screen bg-black/80" />,
});

import animationData from "../../public/loading.json";

export default function Loading() {
  return (
    <div className="bg-black/80 min-h-screen flex items-center justify-center">
      <div className="scale-[0.85]">
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{ width: 800, height: 800 }}
        />
      </div>
    </div>
  );
}
