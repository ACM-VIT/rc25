"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TeamSubmissionProps } from "@/types/submission";
import { formula1Wide } from "@/lib/fonts";
import { formula1Bold } from "@/lib/fonts";

const ROW_WIDTH = "max-w-6xl w-full";

const TeamSubmissions: React.FC<TeamSubmissionProps> = ({
  submissions,
  teamName,
}) => {
  return (
    <div>
      <div className="flex md:hidden justify-center items-center min-h-screen bg-black">
        <h1 className="text-white text-lg">Phone view</h1>
      </div>

      <div
        className="hidden md:flex flex-col w-full min-h-screen items-center gap-4 text-white p-4 pb-0"
        style={{
          backgroundImage: "url('/submission-assets/Submissions-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="p-1 flex justify-center items-center">
          <p className="font-bold text-xl md:text-2xl font-custom tracking-widest">
            {teamName}&apos;s Submissions
          </p>
        </div>

        <div className="flex justify-center w-full flex-1">
          <div className="flex flex-col w-full md:w-[95%] lg:w-[85%] xl:w-[90%] h-full">
            <h1
              className={`${formula1Wide.className} text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 md:mb-8 lg:mb-10 mt-1 sm:mt-2 md:mt-3 lg:mt-4 underline text-center`}
            >
              Submissions
            </h1>

            <div
              className={`${formula1Bold.className} flex flex-row py-4 w-full text-xs md:text-sm font-bold justify-center`}
            >
              <div className={`flex ${ROW_WIDTH}`}>
                <h1 className="w-1/6 text-center">Sl. No</h1>
                <h1 className="w-1/6 text-center">Time</h1>
                <h1 className="w-1/6 text-center">Name</h1>
                <h1 className="w-1/6 text-center">Problem</h1>
                <h1 className="w-1/6 text-center">Difficulty</h1>
                <h1 className="w-1/6 text-center">Status</h1>
              </div>
            </div>

            <ScrollArea className="h-[50vh] md:h-[55vh] rounded-md">
              <div className="space-y-4 mt-2">
                {submissions.map((sub, index) => (
                  <div
                    key={sub.id}
                    className="relative w-full h-12 md:h-13 flex items-center justify-center"
                  >
                    {/* SVG TILE BACKGROUND */}
                    <img
                      src="/submission-assets/submissionTile.svg"
                      alt="submission-tile"
                      className={`absolute ${ROW_WIDTH} w-full object-fill`}
                    />

                    {/* TILE CONTENT */}
                    <div
                      className={`relative z-10 flex ${ROW_WIDTH} text-[10px] md:text-sm`}
                    >
                      <p className="w-1/6 text-center">{index + 1}</p>

                      <p className="w-1/6 text-center">
                        {new Date(sub.createdAt).toLocaleTimeString()}
                      </p>

                      <p className="w-1/6 text-center truncate px-1">
                        {sub.user.name}
                      </p>

                      <p className="w-1/6 text-center truncate px-1">
                        {sub.problem.title}
                      </p>

                      <p className="w-1/6 text-center">
                        {sub.problem.difficulty}
                      </p>

                      <p className="w-1/6 text-center">
                        {sub.testcasesPassed}/{sub.totalTestcases}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamSubmissions;
