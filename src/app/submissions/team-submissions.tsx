"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TeamSubmissionProps } from "@/types/submission"; 
import { formula1Wide } from "@/lib/fonts";
import { formula1Bold } from "@/lib/fonts";
import Team from "@/components/createjoin";

const mocksubmissions = [
  {
    id: "1",
    createdAt: new Date().toISOString(),
    user: { name: "Alice" },
    problem: { title: "Two Sum", difficulty: "Easy" },
    testcasesPassed: 15,
    totalTestcases: 15,
  },
  {
    id: "2",
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    user: { name: "Bob" },
    problem: { title: "Binary Search Tree", difficulty: "Medium" },
    testcasesPassed: 10,
    totalTestcases: 15,
  },
  {
    id: "3",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    user: { name: "Charlie" },
    problem: { title: "Graph Paths", difficulty: "Hard" },
    testcasesPassed: 7,
    totalTestcases: 20,
  },
];


const TeamSubmissions: React.FC<TeamSubmissionProps> = ({ submissions, teamName }) => {



return (
  <div>
    <div className="flex md:hidden justify-center items-center min-h-screen bg-black">
      <h1 className="text-white text-lg">Phone view</h1>
    </div>

    <div
      className="hidden md:flex flex-col w-full min-h-screen items-center gap-4 text-white p-4 pb-0"
      style={{
        backgroundImage: "url('./submission-assets/Submissions_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="p-2 flex justify-center items-center">
        <p className="font-bold text-xl md:text-2xl font-custom tracking-widest">
          {teamName}&apos;s Submissions
        </p>
      </div>

      <div className="flex justify-center w-full flex-1">
        <div className="flex flex-col w-full md:w-[95%] lg:w-[85%] xl:w-[90%] h-full">
            
            <h1 className={`${formula1Wide.className} text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8 md:mb-10 lg:mb-12 mt-2 sm:mt-4 md:mt-6 lg:mt-8 underline text-center`}>
                Submissions
            </h1> 

            <div className={`${formula1Bold.className} flex flex-row py-4 w-full text-xs md:text-sm font-bold`}>
              <h1 className="w-1/6 text-center">Sl. No</h1>
              <h1 className="w-1/6 text-center">Time</h1>
              <h1 className="w-1/6 text-center">Name</h1>
              <h1 className="w-1/6 text-center">Problem</h1>
              <h1 className="w-1/6 text-center">Difficulty</h1>
              <h1 className="w-1/6 text-center">Status</h1>
            </div>

            <ScrollArea className="h-[50vh] md:h-[55vh] rounded-md">
              <div className="space-y-2 mt-2">
                {mocksubmissions.map((sub, index) => (
                  <div
                    key={sub.id}
                    className="relative w-full h-[48px] md:h-[52px] flex items-center justify-center"
                  >
                    {/* SVG TILE BACKGROUND */}
                    <img
                      src={"submission-assets/submissionTile.svg"}
                      alt="submission-tile"
                      className="absolute inset-0 w-full h-full object-fill mx-auto"
                    />

                    {/* TILE CONTENT */}
                    <div className="relative z-10 flex flex-row w-[92%] mx-auto text-[10px] md:text-sm">

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
