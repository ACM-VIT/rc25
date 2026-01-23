"use client";

import DashboardBox from "@/components/DashboardBox";
import { ScrollArea } from "@/components/ui/scroll-area";

// TODO: Update instructions

export default function Instructions() {
    const instructions = [
        {
            title: "Team Formation",
            description:
                "• Each team can have 2-4 members.\n• If you don’t have a teammate, you can search for them on our Discord channel."
        },
        {
            title: "Format",
            description:
                "• There will be 2 rounds.\n• The best performing teams of round 1 will advance to round 2.\n• The team with maximum points at the end of round 2 wins the event.",
        },
        {
            title: "Code Execution and Scoring",
            description:
                "• All participants will be given executable files that display input-output test cases.\n• The code you write should implement the logic based on these input-output files and also fulfill some hidden test cases.\n• Once the code runs you'll be awarded with points from 0 to 100% of the points dedicated to the question on the basis of the number of test cases passed.\n• Each language has a distinct boilerplate code template, and you must write your code within the specified template.",
        },
        {
            title: "Code of Conduct",
            description:
                "• Our portal consists of inter-team plagiarism checks hence sharing codes/answers with other teams can get you disqualified.",
        },
    ];

    return (
        <div
            className="min-h-screen relative flex flex-col items-center justify-center p-6"
            style={{
                backgroundImage: "url('./submissionsbg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <h1 className="text-5xl font-bold text-white mb-6 underline">
                Instructions
            </h1>
            <DashboardBox className="shadow-lg w-[85vw] max-w-4xl h-[70vh] rounded-lg p-6 border text-white bg-opacity-80 backdrop-blur-md">
                <ScrollArea className="grow h-full w-full rounded-lg">
                    <ol className="list-decimal pl-6 space-y-6 text-lg">
                        {instructions.map((instruction) => (
                            <li key={instruction.title}>
                                <h3 className="text-xl font-bold">
                                    {instruction.title}
                                </h3>
                                <ul className="list-inside mt-2 text-sm leading-relaxed">
                                    {instruction.description
                                        .split("\n")
                                        .map((line, idx) => (
                                            <li
                                                key={`${instruction.title}-${idx}`}
                                            >
                                                {line}
                                            </li>
                                        ))}
                                </ul>
                            </li>
                        ))}
                    </ol>
                </ScrollArea>
            </DashboardBox>
        </div>
    );
}
