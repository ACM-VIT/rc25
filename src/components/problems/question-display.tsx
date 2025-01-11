'use client';
import React from 'react';
import { ScrollArea } from '../ui/scroll-area';
import Image from 'next/image';
import windows from '@/components/problems/assets/windows.png';
import mac from '@/components/problems/assets/mac.png';
import linux from '@/components/problems/assets/linux.png';
import { Button } from '../ui/button';

interface Problem {
    difficulty: string;
    maxScore: number;
    description: string;
    mac_dl: string;
    lin_dl: string;
    win_dl: string;
}

export default function QuestionDisplay({ problem }: { problem: Problem }) {
    return (
        <div
            className="h-[78vh] w-[72%] mt-2 ml-20 rounded-[10px]"
            style={{
                background: 'radial-gradient(circle, #241F2A 80%, #39234E 110%)',
            }}
        >
            <ScrollArea className="rounded-[10px] h-full w-full">
                <div className="flex items-center justify-between m-4 flex-wrap">
                    <span className="font-bold text-2xl text-white break-words max-w-[70%]">
                        Problem Details
                    </span>
                    <span className="text-green-500 font-bold text-lg">
                        {problem.difficulty} - {problem.maxScore} points
                    </span>
                </div>
                <hr className="border-t border-gray-700 mx-4 my-2" />
                <div className="text-white m-4  font-medium max-h-fit">
                    {problem.description}
                </div>
                <hr className="border-t border-gray-700 absolute bottom-12 left-3 right-4" />
                <div className="m-4 flex flex-row justify-between">
                    <div className="flex items-center text-white mr-4 text-sm absolute bottom-5 font-bold ">
                        Run On Your Device:
                    </div>
                    <div className="flex flex-row justify-evenly w-[50%] absolute bottom-3 right-20">
                        <Button
                            onClick={() => {
                                window.open(problem.mac_dl, '_blank');
                            }}
                            variant="outline"
                            size="icon"
                            className="bg-[#262626] rounded-[8px] border-0 hover:bg-[#000000] p-1"
                        >
                            <Image src={mac} alt="Mac" />
                        </Button>
                        <Button
                            onClick={() => {
                                window.open(problem.lin_dl, '_blank');
                            }}
                            variant="outline"
                            size="icon"
                            className="bg-[#262626] rounded-[8px] border-0 hover:bg-[#000000] p-1"
                        >
                            <Image src={linux} alt="Linux" />
                        </Button>
                        <Button
                            onClick={() => {
                                window.open(problem.win_dl, '_blank');
                            }}
                            variant="outline"
                            size="icon"
                            className="bg-[#262626] rounded-[8px] border-0 hover:bg-[#000000] p-1"
                        >
                            <Image src={windows} alt="Windows" />
                        </Button>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
