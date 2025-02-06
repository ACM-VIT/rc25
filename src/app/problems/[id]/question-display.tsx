"use client";
import React from "react";
import { ScrollArea, ScrollBar } from "../../../components/ui/scroll-area";
import Image from "next/image";
import windows from "../assets/windows.png";
import mac from "../assets/mac.png";
import linux from "../assets/linux.png";
import { Button } from "../../../components/ui/button";
import DashboardBox from "../../../components/DashboardBox";

interface Problem {
    difficulty: string;
    maxScore: number;
    description: string;
    mac_dl: string;
    lin_dl: string;
    win_dl: string;
}

export default function QuestionDisplay({
    problem,
    desc,
}: {
    problem: Problem;
    desc: React.ReactElement;
}) {
    return (
        <DashboardBox className="rounded-[10px] flex flex-col h-full">
            <ScrollArea className="rounded-[10px] flex-grow w-full">
                <div className="flex items-center justify-between m-4 flex-wrap">
                    <span className="font-bold text-2xl text-white break-words max-w-[70%]">
                        Problem Details
                    </span>
                    <span className="text-green-500 font-bold text-lg">
                        {problem.difficulty} - {problem.maxScore} points
                    </span>
                </div>
                <hr className="border-t border-gray-700 mx-4 my-2" />
                <div className="text-white m-4 font-medium max-h-fit">
                    {desc}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <div className="p-4 flex items-center justify-between mt-auto border-t border-gray-700">
                <div className="text-white text-sm font-bold">
                    Run On Your Device:
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={() => {
                            window.open(problem.mac_dl, "_blank");
                        }}
                        variant="outline"
                        size="icon"
                        className="bg-[#262626] rounded-[8px] border-0 hover:bg-[#000000] p-1"
                    >
                        <Image src={mac} alt="Mac" />
                    </Button>
                    <Button
                        onClick={() => {
                            window.open(problem.lin_dl, "_blank");
                        }}
                        variant="outline"
                        size="icon"
                        className="bg-[#262626] rounded-[8px] border-0 hover:bg-[#000000] p-1"
                    >
                        <Image src={linux} alt="Linux" />
                    </Button>
                    <Button
                        onClick={() => {
                            window.open(problem.win_dl, "_blank");
                        }}
                        variant="outline"
                        size="icon"
                        className="bg-[#262626] rounded-[8px] border-0 hover:bg-[#000000] p-1"
                    >
                        <Image src={windows} alt="Windows" />
                    </Button>
                </div>
            </div>
        </DashboardBox>
    );
}
