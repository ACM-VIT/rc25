"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { formula1Wide } from "@/lib/fonts";

gsap.registerPlugin(ScrollTrigger);

interface HeaderProps {
  title?: string;
}

const Header = ({ title }: HeaderProps) => {
  const headerRef = useRef<HTMLElement>(null);
  const carRef = useRef<HTMLImageElement>(null);
  const linesRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    const car = carRef.current;
    const lines = linesRef.current;
    const text = textRef.current;

    if (!header || !car || !lines || !text) return;

    const playAnimation = () => {
      // Reset positions first
      gsap.set([car, lines, text], {
        x: "100vw",
        opacity: 0,
      });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(car, {
        x: 0,
        opacity: 1,
        duration: 1.2,
      })
        .to(
          lines,
          {
            x: 0,
            opacity: 1,
            duration: 1,
          },
          "-=0.9"
        )
        .to(
          text,
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
          },
          "-=0.7"
        );
    };

    const trigger = ScrollTrigger.create({
      trigger: header,
      start: "top 85%",
      end: "bottom 15%",
      onEnter: playAnimation,
      onEnterBack: playAnimation,
      onLeave: () => {
        gsap.set([car, lines, text], { x: "100vw", opacity: 0 });
      },
      onLeaveBack: () => {
        gsap.set([car, lines, text], { x: "100vw", opacity: 0 });
      },
    });

    // Initial check - if already in viewport, play animation PLS DONT TOUCH THIS
    setTimeout(() => {
      ScrollTrigger.refresh();
      if (trigger.isActive) {
        playAnimation();
      }
    }, 150);

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="relative w-full h-[clamp(60px,9vw,90px)] mt-2 bg-transparent overflow-hidden"
    >

      <img
        ref={linesRef}
        src="/Rectangle 9454.png"
        alt=""
        className="absolute right-0 top-9/20 -translate-y-1/2 w-[90%] h-[80%] z-[1]"
      />

      <div className="relative z-[2] h-full flex items-center justify-between px-[clamp(12px,4vw,32px)]">
        <img
          ref={carRef}
          src="/topbar-car.png"
          alt="RC Car"
          className="w-[clamp(200px,30vw,350px)] h-[clamp(100px,15vw,180px)] shrink-0 -translate-x-[5%] translate-y-[4%] object-contain"
        />

        <h1
          ref={textRef}
          className={`${formula1Wide.className} text-white text-[clamp(12px,2vw,36px)] whitespace-nowrap mr-10`}
        >
          {title}
        </h1>
      </div>
    </header>
  );
};

export default Header;