"use client";

import React, { useState } from "react";
import { runCode } from "@/app/actions/runCode";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/seperator";
import DashboardBox from "@/components/DashboardBox";

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
        <DashboardBox className="p-3 h-full border border-[#A7282D]">
            <div className="flex flex-col h-full justify-between">
                <div className="text-white text-2xl font-semibold mb-4">
                    Terminal
                </div>
                <hr className="border-t-2 border-[#A7282D] w-full mb-2" />
                <div className="flex flex-row justify-between h-[75%] rounded-[10px]">
                    <div className="flex flex-col w-1/2 px-4">
                        <div className="relative h-full rounded-[10px] bg-[#A7282D] flex flex-col"
                        >
                            <h3 className="absolute top-4 left-4 text-lg font-semibold text-white z-10">
                                Input
                            </h3>
                            <textarea
                                className="w-full flex-1 mt-5 text-white pt-8 p-4 rounded-[10px] resize-none focus:outline-none placeholder:text-base"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter Your Input"
                                rows={10}
                            />
                            <div className="p-2 flex justify-end">
                                <Button
                                    className="text-black border border-black bg-[#FF9397] hover:bg-secondary px-6 text-lg rounded-md"
                                    onClick={handleRun}
                                    disabled={isRunning}
                                >
                                    {isRunning ? "Running..." : "Run"}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Separator orientation="vertical" />
                    <div className="flex flex-col w-1/2 px-4">
                        <div className="relative h-full rounded-[10px] bg-[#A7282D]"
                             >
                            <h3 className="absolute  top-4 left-4 text-base font-semibold text-white">
                                Output
                            </h3>
                            <textarea
                                className="w-full h-full text-nowrap overflow-x-auto mt-5 bg-transparent text-white pt-8 p-4 rounded-[10px] resize-none focus:outline-none placeholder:text-sm"
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
