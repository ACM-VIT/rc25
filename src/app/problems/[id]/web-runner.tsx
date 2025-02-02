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
        <DashboardBox className="p-3 h-full">
            <div className="flex flex-col h-full justify-between">
                <div className="text-white text-lg font-semibold mb-4">
                    Terminal
                </div>
                <hr className="border-t-2 border-gray-700 w-full mb-2" />
                <div className="flex flex-row justify-between h-[75%] rounded-[10px]">
                    <div className="flex flex-col w-1/2 px-4">
                        <div className="relative h-full">
                            <h3 className="absolute top-2 left-4 text-sm font-semibold text-white">
                                Input
                            </h3>
                            <Button
                                className="absolute top-3 right-4 text-white bg-primary hover:bg-secondary px-3 py-1 rounded-md text-xs "
                                onClick={handleRun}
                                disabled={isRunning}
                            >
                                {isRunning ? "Running..." : "Run"}
                            </Button>
                            <textarea
                                className="w-full h-[100%] mt-2 bg-[#3C3C46] text-white p-4 rounded-[10px] resize-none focus:outline-none placeholder:text-sm"
                                style={{
                                    background:
                                        "radial-gradient(circle, #36253D 80%, #39234E 110%)",
                                }}
                                value={input}
                                onChange={(e) => setInput(e.target.value.trim())}
                                placeholder="Enter Your Input"
                            />
                        </div>
                    </div>
                    <Separator orientation="vertical" />
                    <div className="flex flex-col w-1/2 px-4">
                        <div className="relative h-full">
                            <h3 className="absolute top-2 left-4 text-sm font-semibold text-white">
                                Output
                            </h3>
                            <textarea
                                className="w-full h-[100%] mt-2 bg-[#3C3C46] text-white p-4 rounded-[10px] resize-none focus:outline-none placeholder:text-sm"
                                style={{
                                    background:
                                        "radial-gradient(circle, #36253D 80%, #39234E 110%)",
                                }}
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
