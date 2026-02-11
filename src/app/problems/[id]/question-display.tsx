"use client";
import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import DashboardBox from "../../../components/DashboardBox";
import { FaCircleExclamation } from "react-icons/fa6";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { formula1Bold } from "@/lib/fonts";
import { Poppins } from "next/font/google";

const poppins = Poppins({ weight: ["400", "500", "600"], subsets: ["latin"] });


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
        <div className="rounded-[10px] flex flex-col h-full w-full border border-[#A7282D] p-3 sm:p-4 bg-black gap-3">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0">
                <span className={`font-bold text-lg sm:text-xl text-white wrap-break-word ${formula1Bold.className}`}>
                    Problem Details
                </span>

                <span className={`text-green-500 font-bold text-sm sm:text-base whitespace-nowrap ${poppins.className}`}>
                    {problem.difficulty} - {problem.initial} points
                </span>
            </div>
            
            <hr className="border-t border-[#A7282D] shrink-0" />

            {/* Main Content Area */}
            <div className="rounded-[10px] flex-1 min-h-0 overflow-y-auto hide-scrollbar">
                <div className={`text-white text-sm sm:text-base font-medium pr-2 ${poppins.className}`}>
                    {desc}
                </div>
            </div>
            
            <hr className="border-t border-[#A7282D] shrink-0" />

            {/* Important Detail Section */}
            <div className="w-full border border-[#A7282D] rounded-lg shrink-0">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-xs sm:text-sm text-[#A2A2A2] p-2 flex items-center gap-2 w-full justify-between bg-[#1E1E1E] rounded-lg hover:bg-[#2E2E2E] transition-colors"
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <FaCircleExclamation className="shrink-0" />
                        <span className="font-semibold text-[12px] truncate">IMPORTANT DETAIL</span>
                    </div>
                    {isOpen ? (
                        <ChevronUp size={16} className="shrink-0" />
                    ) : (
                        <ChevronDown size={16} className="shrink-0" />
                    )}
                </button>

                {isOpen && (
                    <div className="p-2 sm:p-3 border-t border-[#A7282D] bg-[#121212] rounded-lg">
                        <p className={`text-[#A2A2A2] text-[20px] sm:text-[14px] leading-relaxed ${poppins.className}`}>
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
            
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
