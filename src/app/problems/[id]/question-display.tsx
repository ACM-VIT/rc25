"use client";
import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import DashboardBox from "../../../components/DashboardBox";
import { FaCircleExclamation } from "react-icons/fa6";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";


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
        <div className="rounded-[10px] flex flex-col h-full w-full border border-[#A7282D] p-4 bg-black">
            {/* Main Content Area (Expands) */}
            <div className="rounded-[10px] min-h-0 overflow-auto hide-scrollbar">
                <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-xl text-white wrap-break-word max-w-[70%]">
                        Problem Details
                    </span>
    
                    <span className="text-green-500 font-bold text-base">
                        {problem.difficulty} - {problem.initial} points
                    </span>
                </div>
                
                <hr className="border-t border-[#A7282D] mx-4 my-2" />
                <div className="text-white m-4 font-medium max-h-fit">
                    {desc}
                </div>
            </div>
            
            <hr className="border-t border-[#A7282D] mx-4 my-2" />

            <div className="ml-4 w-[60%] border border-[#A7282D] rounded-lg">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-[11px] text-[#A2A2A2] p-2 flex items-center gap-2 w-full justify-between bg-[#1E1E1E] rounded-lg"
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

                {isOpen && (
                    <div className="p-2 border-t border-[#A7282D] bg-[#121212] rounded-lg">
                        <p className="text-[#A2A2A2] text-[11px] md:text-[55%] xl:text-[11px]">
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

            <div className="flex flex-col w-full" />
            
            <div className="ml-4 mt-2 mb-2 flex items-center gap-3">
                <span className="text-white font-light text-base">Run on your device:</span>
                <div className="flex gap-6 ml-5 ">
                    <Image src="/os/windows.svg" alt="Windows" width={20} height={20} className="cursor-pointer" />
                    <Image src="/os/apple.svg" alt="macOS" width={20} height={20} className="cursor-pointer" />
                    <Image src="/os/linux.svg" alt="Linux" width={20} height={20} className="cursor-pointer" />
                </div>
            </div>
            
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
