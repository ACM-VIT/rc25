"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import SmoothInfiniteScroll from "./infinitescroll";

// 🌀 Magic UI: Embla Carousel Hook
interface CarouselIndicatorState {
  selectedIndex: number;
  scrollSnaps: number[];
  onDotButtonClick: (index: number) => void;
}

import { EmblaCarouselType } from "embla-carousel";

interface EmblaApiType extends EmblaCarouselType {
  selectedScrollSnap: () => number;
  scrollSnapList: () => number[];
  scrollTo: (index: number) => void;
}

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

// 🟢 Carousel Indicator Component
const CarouselIndicator = ({
  onClick,
  className,
}: {
  onClick: () => void;
  className: string;
}) => <button onClick={onClick} className={className} />;

const FaqMobile: React.FC = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: false,
  });
  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useCarouselIndicator(emblaApi);
  const [activeBox, setActiveBox] = useState<number | null>(null);

  const contentBoxes = [
    {
      defaultText: "What is Magic UI?",
      alternateText: "Magic UI is a supercharged UI library.",
    },
    {
      defaultText: "How does it work?",
      alternateText: "It uses Embla Carousel with animations.",
    },
    {
      defaultText: "Is it responsive?",
      alternateText: "Yes! Fully adaptive for all devices.",
    },
    {
      defaultText: "Why use this?",
      alternateText: "For a seamless and dynamic UI experience.",
    },
    {
      defaultText: "Can I customize it?",
      alternateText: "Absolutely! Tailor it to your needs.",
    },
    {
      defaultText: "Is it hard to implement?",
      alternateText: "Nope! Just plug and play.",
    },
  ];

  const handleBoxClick = (index: number) => {
    setActiveBox(activeBox === index ? null : index);
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* Background Image */}
      <Image
        src="https://rc25-assets.acmvit.in/landing_new/faqbg.png"
        alt="bg"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 z-0"
      />

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Title */}
        <div className="flex how-it-works-heading text-white justify-center pt-8 pb-2 text-7xl text-center">
          HOLO GUIDE
        </div>

        {/* Carousel Container */}
        <div className="flex-1 flex items-center justify-center px-4 md:px-20 h-[60vh] mb-36">
          <div className="w-full max-w-7xl">
            <div ref={emblaRef} className="overflow-hidden ">
              <div className="flex">
                {contentBoxes.map((box, index) => (
                  <div
                    key={index}
                    className="embla__slide min-w-full flex justify-center"
                  >
                    <div
                      className={`bg-[#222222] backdrop-blur w-[70vw] flex items-center justify-center h-[20vh] bg-opacity-80 p-6 phone:p-8 rounded text-white border border-[#9B51E0] border-opacity-50 transition-all duration-300 ease-in-out cursor-pointer sm:text-xl md:text-2xl
                        ${
                          activeBox === index
                            ? "bg-[#424242] shadow-[0_0_10px_rgba(255,255,255,1),0_0_20px_rgba(206,183,255,0.6),0_0_30px_rgba(155,81,224,0.8)] scale-105"
                            : ""
                        }`}
                      onClick={() => handleBoxClick(index)}
                    >
                      <span>
                        {activeBox === index
                          ? box.alternateText
                          : box.defaultText}
                      </span>
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
                  className={`w-3 h-1 rounded-full mt-8 ${
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
        <div className="absolute bottom-12 w-full z-20 rotate-[-10deg]">
          <SmoothInfiniteScroll
            text="TRY YOU MUST &nbsp; TRY YOU MUST"
            speed={0.5}
          />
          <SmoothInfiniteScroll
            text="UNTIL THE TASK IS DONE &nbsp; UNTIL THE TASK IS DONE"
            speed={0.6}
          />
        </div>
      </div>
    </div>
  );
};

export default FaqMobile;
