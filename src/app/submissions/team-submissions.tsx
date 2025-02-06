"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardBox from "@/components/DashboardBox";
import type { TeamSubmissionProps } from "@/types/submission";

const TeamSubmissions: React.FC<TeamSubmissionProps> = ({ submissions, teamName }) => {
  return (
    <div>
      <div className="flex md:hidden">
        <h1 className="text-white">Phone view</h1>
      </div>

      <div
        className="hidden md:flex flex-col w-full h-[90%] items-center gap-4 text-white p-4 pb-0 min-h-screen"
        style={{ backgroundImage: "url('./submissionsbg.png')", backgroundSize: "cover" }}
      >
        <div className="p-2 justify-center items-center">
          <p className="font-bold text-2xl font-custom underline underline-offset-4 decoration-white">
            {teamName}&apos;s Submissions
          </p>
        </div>
        <div className="flex justify-center w-full h-[85%]">
          <div className="flex flex-col w-full md:w-[90%] lg:w-[80%] xl:w-[90%] h-full">
            <DashboardBox className="flex flex-col h-[80%] p-6 mb-4 text-white">
              <p className="text-xl font-semibold border-b-2 text-center border-white pt-0 pb-4">
                Submissions
              </p>
              <div className="flex flex-row border-b-2 py-4 w-full">
                <h1 className="w-1/6 text-xs md:text-sm font-bold text-center">Sl. No</h1>
                <h1 className="w-1/6 text-xs md:text-sm font-bold text-center">Time</h1>
                <h1 className="w-1/6 text-xs md:text-sm font-bold text-center">Name</h1>
                <h1 className="w-1/6 text-xs md:text-sm font-bold text-center">Problem</h1>
                <h1 className="w-1/6 text-xs md:text-sm font-bold text-center">Difficulty</h1>
                <h1 className="w-1/6 text-xs md:text-sm font-bold text-center">Status</h1>
              </div>
              <ScrollArea className="h-[55vh] rounded-md">
                <div className="space-y-0">
                  {submissions.map((sub, index) => (
                    <div key={sub.id} className="flex flex-row border-b border-gray-700 py-4">
                      <p className="w-1/6 text-center p-2 py-0">{index + 1}</p>
                      <p className="w-1/6 text-center p-2 py-0">
                        {new Date(sub.createdAt).toLocaleTimeString()}
                      </p>
                      <p className="w-1/6 text-center p-2 py-0">{sub.user.name}</p>
                      <p className="w-1/6 text-center p-2 py-0">{sub.problem.title}</p>
                      <p className="w-1/6 text-center p-2 py-0">{sub.problem.difficulty}</p>
                      <p className="w-1/6 text-center p-2 py-0">
                        {sub.testcasespassed.filter(Boolean).length}/{sub.testcasespassed.length}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DashboardBox>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamSubmissions;
