"use client";

import Image from "next/image";
import formula1car from "../../public/formula1car.png";
import loaderTrack from "../../public/road.png";
import gsap from "gsap";
import { useEffect, useRef } from "react";

export default function Loading() {
  const carRef = useRef<HTMLImageElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (carRef.current && dotsRef.current) {
      const tl = gsap.timeline();
      
      tl.fromTo(
        carRef.current,
        { x: "-100vw" },
        { x: "0%", duration: 1.5, ease: "power2.out" }
      )
      .fromTo(
        dotsRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-black hidden lg:flex flex-col items-center justify-center overflow-hidden relative">
      <Image
        src={loaderTrack}
        alt="Track"
        fill
        className="object-contain"
        priority
      />
      <Image
        ref={carRef}
        src={formula1car}
        alt="Loading"
        className="w-1/7 h-auto translate-x-[-100vw] z-10 relative pt-27.5"
      />
      <div ref={dotsRef} className="flex gap-2 pt-25 z-10 opacity-0">
        <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-3 h-3 bg-white rounded-full animate-bounce" />
      </div>
    </div>
  );
}
