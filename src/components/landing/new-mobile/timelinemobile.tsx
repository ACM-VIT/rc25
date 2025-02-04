"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import timelinebg from "@/app/assets/timelinebg.svg";
import upper from "@/app/assets/upperbracket.svg";
import lower from "@/app/assets/lowerbracket.svg";
import SmoothInfiniteScroll from "./infinitescroll";
import { EmblaCarouselType } from "embla-carousel";

// 🌀 Carousel Hook for Navigation Indicators
interface CarouselIndicatorState {
  selectedIndex: number;
  scrollSnaps: number[];
  onDotButtonClick: (index: number) => void;
}

type EmblaApiType = EmblaCarouselType;

const useCarouselIndicator = (
  emblaApi: EmblaApiType | undefined
): CarouselIndicatorState => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const onDotButtonClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return { selectedIndex, scrollSnaps, onDotButtonClick };
};

// ✅ Timeline Data
const timelineData = [
  /* change datatatataata */
  { notation: "8:00 am", value: "Gates Open" },
  { notation: "8:30 am", value: "Opening Ceremony" },
  { notation: "9:00 am", value: "Round-1 Begins" },
  { notation: "12:00 pm", value: "Speaker Session" },
  { notation: "1:00 pm", value: "Lunch & Round-1 Results" },
  { notation: "2:30 pm", value: "Round-2 Begins" },
  { notation: "6:30 pm", value: "Closing Ceremony" },
];

// ✅ Text Glow Effect
const textGlowStyle = {
  textShadow: "0 0 1px #CEB7FF, 0 0 4px #CEB7FF",
};

// ✅ Carousel Indicator Component
const CarouselIndicator = ({
  onClick,
  className,
}: {
  onClick: () => void;
  className: string;
}) => <button onClick={onClick} className={className} />;

const TimeLineMobile: React.FC = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    dragFree: false,
  });

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useCarouselIndicator(emblaApi);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Background Image */}
      <Image
        src={timelinebg}
        alt="background"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 z-0"
        priority
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Fixed Header */}
        <div className="pb-3">
          <div className="text-white how-it-works-heading text-center pt-8 sm:pt-12 text-6xl xs:text-8xl phone:text-7xl xs-sm:text-8xl sm:text-8xl md:text-8xl lg:text-9xl">
            TIMELINE
          </div>
        </div>

        {/* Carousel Container */}
        <div className="flex-1 flex justify-center items-center mb-36">
          <div className="w-full max-w-5xl">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-x-6">
                {timelineData.map((item, index) => (
                  <div
                    key={index}
                    className="embla__slide flex-shrink-0 min-w-[100vw] sm:min-w-[65vw] md:min-w-[55vw] flex justify-center py-8"
                  >
                    <div className="relative group w-[50vw] aspect-video bg-white/40 border border-[#CEB7FF] transition-all duration-300 ease-in-out hover:bg-white/20">
                      {/* Top Left Bracket */}
                      <div className="absolute -top-2 -left-2">
                        <Image
                          src={upper}
                          alt="upper bracket"
                          width={20}
                          height={20}
                        />
                      </div>

                      {/* Glow Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-70 transition-all duration-100 ease-in-out bg-[#F2ECFF]/90 backdrop-blur-sm shadow-[0_0_20px_rgba(242,236,255,0.6)] group-hover:shadow-[0_0_30px_rgba(242,236,255,0.8)]" />

                      {/* Content */}
                      <div className="relative z-10 h-full flex flex-col items-center justify-center text-black p-4 text-center">
                        <div
                          className="text-xl mb-2"
                          style={{
                            fontFamily: "Audiowide, cursive",
                            ...textGlowStyle,
                          }}
                        >
                          {item.notation}
                        </div>
                        <div
                          className="text-lg"
                          style={{
                            fontFamily: "Audiowide, cursive",
                            ...textGlowStyle,
                          }}
                        >
                          {item.value}
                        </div>
                      </div>

                      {/* Bottom Right Bracket */}
                      <div className="absolute -bottom-2 -right-2">
                        <Image
                          src={lower}
                          alt="lower bracket"
                          width={20}
                          height={20}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Indicators */}
            <div className="flex justify-center space-x-2 mt-4">
              {scrollSnaps.map((_, index) => (
                <CarouselIndicator
                  key={index}
                  onClick={() => onDotButtonClick(index)}
                  className={`w-3 h-3 rounded-full ${
                    index === selectedIndex
                      ? "bg-white scale-125"
                      : "bg-gray-500"
                  } transition-transform duration-300`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Smooth Infinite Scroll */}
        <div className="absolute bottom-10 w-full z-20 rotate-[-10deg]">
          <SmoothInfiniteScroll
            text="TRY YOU MUST &nbsp; TRY YOU MUST"
            speed={0.5}
          />
          <SmoothInfiniteScroll
            text="UNTIL THE TASK IS DONE &nbsp; UNTIL THE TASK IS DONE"
            speed={0.5}
          />
        </div>
      </div>
    </div>
  );
};
export default TimeLineMobile;
