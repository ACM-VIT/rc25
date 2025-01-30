import React, { useEffect, useRef } from "react";

interface SmoothInfiniteScrollProps {
  text: string;
  speed?: number; // Speed parameter in pixels per frame
}

const SmoothInfiniteScroll: React.FC<SmoothInfiniteScrollProps> = ({
  text,
  speed = 1, // Default speed
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let position = 0;
    let animationFrameId: number;

    const scroll = () => {
      if (!scrollRef.current) return;

      position -= speed; // Use the speed parameter to control scroll speed

      // Reset position when text has scrolled its full width
      if (position <= -scrollRef.current.offsetWidth / 2) {
        position = 0;
      }

      scrollRef.current.style.transform = `translateX(${position}px)`;
      animationFrameId = requestAnimationFrame(scroll);
    };

    scroll();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed]); // Dependency on speed

  return (
    <div className="w-full overflow-allow">
      <div
        ref={scrollRef}
        className="inline-flex whitespace-nowrap"
        style={{ willChange: "transform" }}
      >
        <span className="mx-4 text-5xl xs-sm:text-6xl font-extrabold text-white how-it-works-heading text-glow">
          {text}
        </span>
        <span className="mx-4 text-5xl xs-sm:text-6xl font-extrabold text-white how-it-works-heading text-glow">
          {text}
        </span>
      </div>
    </div>
  );
};

export default SmoothInfiniteScroll;
