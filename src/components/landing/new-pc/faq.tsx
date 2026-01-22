import React from "react";
import Image from "next/legacy/image";
import faqbg from "../../../../public/landing_new/faqbg.png";

const Faq: React.FC = () => {
  const contentBoxes = [
    {
      defaultText:
        "Which programming languages can be used?",
      hoverText: "You can code in C, C++, Python, Java, JavaScript, Golang and Rust",
    },
    {
      defaultText:
        "How many members can there be in a team?",
      hoverText: "Each team can have 2-4 members. If you don't have a teammate, you can search for them on our Discord channel.",
    },
    {
      defaultText:
        "Can I change my current team?",
      hoverText: "Yes, you can leave a team and join another before the competition starts.",
    },
    {
      defaultText:
        "Which teams qualify for Round 2?",
      hoverText: "It will be decided after looking at the general performance of teams at the end of round 1.",
    },
    {
      defaultText:
        "Is there a registration fee?",
      hoverText: "No! Reverse Coding is completely free of cost.",
    },
    {
      defaultText:
        "How is the winner decided?",
      hoverText: "The team who cleared Round 1 and is at the top of the leaderboard by the end of Round 2 will be the winner of Reverse Coding!",
    },
  ];

  return (
    <div className="relative w-screen h-screen bg-black overflow-y-hidden">
      <div
        className="absolute mx-0 top-4 h-full flex items-center z-20"
        style={{
          writingMode: "vertical-lr",
          fontFamily: "Death Star, sans-serif",
          color: "transparent",
          WebkitTextStroke: "1px rgba(255, 255, 255, 1)",
        }}
      >
        <span className="text-glow font-extrabold transform text-glow how-it-works-heading rotate-180 lg:text-[30px] xl:text-[45px] lg:text-5xl tracking-wider">
          ASK YOU MUST
        </span>
      </div>

      <div
        className="absolute right-4 bottom-4 flex items-center z-20"
        style={{
          writingMode: "vertical-rl",
          fontFamily: "Death Star, sans-serif",
          color: "transparent",
          WebkitTextStroke: "1px rgba(255, 255, 255, 1)",
        }}
      >
        <span className="text-glow -m-1 font-extrabold transform text-glow how-it-works-heading rotate-180 lg:text-[30px] xl:text-[45px] lg:text-5xl tracking-wider">
          ANSWER WE WILL
        </span>
      </div>

      <Image
        src={faqbg || "/placeholder.svg"}
        alt="bg"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />

      <div className="flex flex-col relative z-10 h-full">
        <div className="flex how-it-works-heading text-white justify-center lg:text-[80px] xl:text-[115px] text-center">
          HOLO-GUIDE
        </div>

        <div className="flex flex-col h-full justify-center items-center px-80 lg:px-48 md:px-28 sm:px-24 xs:px-20 py-16">
          <div className="grid grid-cols-2 gap-x-20 gap-y-8 xl:gap-x-20 xl:gap-y-8 md:gap-x-12 md:gap-y-4 sm:gap-x-8 sm:gap-y-4 xs:gap-4 mb-16">
            {contentBoxes.map((box, index) => (
              <div
                key={index}
                className="flex space-x-12 items-center justify-center h-[14vh] xl:h-[16vh] lg:h-[14vh] md:h-[12vh] w-[30vw] xl:w-[35vw] bg-[#222222] backdrop-blur bg-opacity-80 hover:bg-[#424242] hover:p-4 font-outfit rounded text-white border border-[#9B51E0] border-opacity-50 transition-all duration-200 ease-in-out shadow-[0_0_6px_rgba(255,255,255,1),0_0_15px_rgba(206,183,255,0.6),0_0_25px_rgba(155,81,224,0.7)] group"
              >
                <span className="group-hover:hidden text-center text-base xl:text-lg lg:text-base md:text-sm">
                  {box.defaultText}
                </span>
                <span className="hidden group-hover:inline text-center text-base xl:text-lg lg:text-base md:text-sm">
                  {box.hoverText}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;