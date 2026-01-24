"use client";
import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import DashboardBox from "../../../components/DashboardBox";
import { FaCircleExclamation } from "react-icons/fa6";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Problem {
    difficulty: string;
    initial: number;
    description: string;
}

export default function QuestionDisplay({
    problem,
    desc,
}: {
    problem: Problem;
    desc: React.ReactElement;
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DashboardBox className="rounded-[10px] flex flex-col h-full w-full">
            {/* Main Content Area (Expands) */}
            <ScrollArea className="rounded-[10px] w-full min-h-0 flex-1">
                <div className="flex items-center justify-between m-4 flex-wrap">
                    <span className="font-bold text-2xl text-white wrap-break-word max-w-[70%]">
                        Problem Details
                    </span>
                    <span className="text-green-500 font-bold text-lg">
                        {problem.difficulty} - {problem.initial} points
                    </span>
                </div>
                <div className="ml-4 w-[60%] border border-purple-700 rounded-lg">
                    {/* Accordion Header */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-xs text-[#A2A2A2] p-2 flex items-center gap-2 w-full justify-between bg-[#1E1E1E] rounded-lg"
                    >
                        <div className="flex items-center gap-2">
                            <FaCircleExclamation />
                            <span>IMPORTANT DETAIL</span>
                        </div>
                        {isOpen ? (
                            <ChevronUp size={16} />
                        ) : (
                            <ChevronDown size={16} />
                        )}
                    </button>

                    {/* Accordion Content */}
                    {isOpen && (
                        <div className="p-2 border-t border-purple-700 bg-[#121212] rounded-lg">
                            <p className="text-[#A2A2A2] text-xs md:text-[60%] xl:text-xs">
                                Use the I/O Runner below to experiment with
                                inputs and uncover the logic behind the expected
                                output. Once you&apos;ve reverse-engineered the
                                solution, write your code in the embedded
                                editor, submit it, and view the results in the
                                submissions pane.
                            </p>
                        </div>
                    )}
                </div>
                <hr className="border-t border-gray-700 mx-4 my-2" />
                <div className="text-white m-4 font-medium max-h-fit">
                    {desc}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Footer Sections Container */}
            <div className="flex flex-col w-full" />
        </DashboardBox>
    );
}
