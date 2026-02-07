"use client";

import React, { useState } from "react";
import { runCode } from "@/app/actions/runCode";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/seperator";
import DashboardBox from "@/components/DashboardBox";
import { formula1Bold } from "@/lib/fonts";
import { Poppins } from "next/font/google";

const poppins = Poppins({ weight: ["400", "500", "600"], subsets: ["latin"] });

interface Problem {
    id: string;
    title: string;
    description: string;
}

interface WebRunnerProps {
    problem: Problem;
}

export default function WebRunner({ problem }: WebRunnerProps) {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);

    const handleRun = async () => {
        setIsRunning(true);
        try {
            const result = await runCode(problem.id, input.trim());
            setOutput(result.output);
        } catch (error) {
            setOutput(`Error running code: ${error}`);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <DashboardBox className="p-3 h-full border border-[#A7282D] flex flex-col overflow-hidden">
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            <div className="flex flex-col gap-2 h-full min-h-0 w-full">
                <div className={`text-white text-2xl font-semibold shrink-0 ${formula1Bold.className}`}>
                    Terminal
                </div>
                <hr className="border-t-2 border-[#A7282D] w-full shrink-0 my-1" />
                <div className="flex flex-row gap-2 flex-1 min-h-0 min-w-0 w-full">
                    <div className="flex flex-col flex-1 min-w-0 min-h-0">
                        <div className="h-full w-full rounded-[10px] bg-[#A7282D] flex flex-col min-h-0 overflow-hidden">
                            <div className="shrink-0 p-3 pb-2 min-w-0">
                                <h3 className={`text-base font-semibold text-white truncate ${poppins.className}`}>
                                    Input
                                </h3>
                            </div>
                            <textarea
                                className={`flex-1 min-h-0 w-full text-white px-3 hide-scrollbar bg-transparent resize-none focus:outline-none placeholder:text-sm overflow-auto ${poppins.className}`}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter Your Input"
                            />
                            <div className="p-2 flex justify-end shrink-0 min-w-0">
                                <Button
                                    className="text-black border border-black bg-[#FF9397] hover:bg-secondary px-4 py-1 text-sm rounded-md whitespace-nowrap"
                                    onClick={handleRun}
                                    disabled={isRunning}
                                >
                                    {isRunning ? "Running..." : "Run"}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Separator orientation="vertical" className="shrink-0" />
                    <div className="flex flex-col flex-1 min-w-0 min-h-0">
                        <div className="h-full w-full rounded-[10px] bg-[#A7282D] flex flex-col min-h-0 overflow-hidden">
                            <div className="shrink-0 p-3 pb-2 min-w-0">
                                <h3 className={`text-base font-semibold text-white truncate ${poppins.className}`}>
                                    Output
                                </h3>
                            </div>
                            <textarea
                                className={`flex-1 min-h-0 w-full text-white px-3 pb-3 bg-transparent resize-none focus:outline-none placeholder:text-sm overflow-auto hide-scrollbar ${poppins.className}`}
                                value={output}
                                readOnly
                                placeholder="Output here"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardBox>
    );
}