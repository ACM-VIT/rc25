"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import faqbg from "../../../../public/landing_new/faqbg.png";
import SmoothInfiniteScroll from "./infinitescroll";

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
      defaultText:
        "Which programming languages can be used?",
      alternateText: "You can code in C, C++, Python, Java, JavaScript, Golang and Rust",
    },
    {
      defaultText:
        "How many members can there be in a team?",
      alternateText: "Each team can have 2-4 members. If you don’t have a teammate, you can search for them on our Discord channel.",
    },
    {
      defaultText:
        "Can I change my current team?",
      alternateText: "Yes, you can leave a team and join another before the competition starts.",
    },
    {
      defaultText:
        "Which teams qualify for Round 2?",
      alternateText: "It will be decided after looking at the general performance of teams at the end of round 1.",
    },
    {
      defaultText:
        "Is there a registration fee?",
      alternateText: "No! Reverse Coding is completely free of cost.",
    },
    {
      defaultText:
        "How is the winner decided?",
      alternateText: "The team who cleared Round 1 and is at the top of the leaderboard by the end of Round 2 will be the winner of Reverse Coding!",
    },
  ];

  const handleBoxClick = (index: number) => {
    setActiveBox(activeBox === index ? null : index);
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      <Image
        src={faqbg || "/placeholder.svg"}
        alt="bg"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 z-0"
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex how-it-works-heading text-white justify-center pt-8 pb-2 text-7xl text-center">
          HOLO GUIDE
        </div>

        <div className="flex-1 flex items-center justify-center px-4 md:px-20 h-[70vh] mb-36">
          <div className="w-full max-w-7xl">
            <div ref={emblaRef} className="overflow-visible py-8">
              <div className="flex">
                {contentBoxes.map((box, index) => (
                  <div
                    key={index}
                    className="embla__slide min-w-full flex justify-center"
                  >
                    <div className="px-4 py-2 w-[70vw]">
                      <div
                        className={`bg-[#222222] backdrop-blur flex items-center justify-center 
                          h-[20vh] bg-opacity-80 p-4 rounded text-white 
                          transition-all duration-300 ease-in-out cursor-pointer
                          border border-[#9B51E0] border-opacity-50
                          outline-none 
                          ${
                            activeBox === index
                              ? "bg-[#424242] shadow-[0_0_10px_rgba(255,255,255,1),0_0_20px_rgba(206,183,255,0.6),0_0_30px_rgba(155,81,224,0.8)] scale-105 outline outline-2 outline-[#9B51E0]"
                              : ""
                          }`}
                        onClick={() => handleBoxClick(index)}
                      >
                        <span className="text-sm sm:text-base md:text-lg lg:text-xl text-center max-w-[90%]">
                          {activeBox === index
                            ? box.alternateText
                            : box.defaultText}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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