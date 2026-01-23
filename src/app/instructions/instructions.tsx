"use client";

import DashboardBox from "@/components/DashboardBox";
import NumberedCard from "@/components/NumberedCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formula1Bold, formula1Wide } from "@/lib/fonts";

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
            className="min-h-screen relative flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8"
            style={{
                backgroundImage: "url('/Dashboard.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <h1 className={`${formula1Wide.className} text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 sm:mb-12 md:mb-16 lg:mb-20 mt-4 sm:mt-6 md:mt-8 lg:mt-10 underline`}>
                Instructions
            </h1>

            <div className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[80%] mx-auto flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {instructions.map((instruction, index) => (
                    <NumberedCard key={index} title={instruction.title} index={index + 1} />
                ))}
            </div>
        </div>
    );
}
