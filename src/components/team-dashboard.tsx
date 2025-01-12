import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import CountdownTimer from "@/components/countdown-timer";
// import { Separator } from "@/components/ui/separator"

const Dashboard: React.FC = () => {
    const questions = Array.from({ length: 20 }).map((_, i) => {
        const difficulties = ["Easy", "Medium", "Hard"];
        const randomDifficulty =
            difficulties[Math.floor(Math.random() * difficulties.length)];
        const totalCases = Math.floor(Math.random() * 6) + 5; // Random number between 5 and 10
        const casesPassed = Math.floor(Math.random() * (totalCases + 1)); // Random number between 0 and totalCases

        return {
            slno: i + 1,
            questionName: `Question ${i + 1}`,
            difficulty: randomDifficulty,
            casesPassed: casesPassed,
            totalCases: totalCases,
        };
    });

    return (
        <>
            <div className="flex md:hidden">
                <h1 className="text-white">Phone pe code karega chutiye?</h1>
            </div>
            <div className="hidden md:flex flex-col w-full h-[90%] items-center gap-4 text-white p-4 pb-0">
                <div className="p-2 justify-center items-center">
                    <p className="font-bold text-2xl font-[Audiowide] underline underline-offset-4 decoration-white">
                        Round 1
                    </p>
                </div>
                <div className="flex flex-row gap-5 w-[95%] h-[85%]">
                    <div className="flex flex-col w-1/4 h-full justify-between">
                        <div
                            style={{
                                background: `linear-gradient(0deg, rgba(57, 35, 78, 0.25), rgba(57, 35, 78, 0.25)),
                 linear-gradient(0deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03))`,
                            }}
                            className="flex flex-col max-h-1/2 ove p-6 shadow-lg rounded-lg text-white"
                        >
                            <p className="text-xl font-semibold border-b-2 text-center border-white pt-0 pb-4">
                                Team Name
                            </p>
                            <ul className="space-y-3 pt-4 px-1">
                                <li className="flex justify-between">
                                    <p>Team Member 1 </p>
                                    <p>99 pts</p>
                                </li>
                                <li className="flex justify-between">
                                    <p>Team Member 2</p>
                                    <p>99 pts</p>
                                </li>
                                <li className="flex justify-between">
                                    <p>Team Member 3</p>
                                    <p>99 pts</p>
                                </li>
                                <li className="flex justify-between">
                                    <p>Team Member 4</p>
                                    <p>99 pts</p>
                                </li>
                            </ul>
                        </div>
                        <div className="w-full">
                            <CountdownTimer
                                getTimeUntil={new Date(
                                    new Date().getTime() +
                                        Math.random() * 72000000
                                ).toISOString()}
                            />
                        </div>
                    </div>

                    <div
                        style={{
                            background: `linear-gradient(0deg, rgba(57, 35, 78, 0.25), rgba(57, 35, 78, 0.25)),
                 linear-gradient(0deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03))`,
                        }}
                        className="w-[50vw] p-7 pt-0 rounded-lg overflow-y-hidden overflow-x-auto"
                    >
                        <p className="text-2xl font-semibold border-b-2 border-white p-2 py-4 mb-4">
                            Questions
                        </p>
                        <div className="flex flex-row border-b-2 pb-4 w-full">
                            <h1 className="w-1/6 text-xs md:text-sm font-bold text-center">
                                Sr. No
                            </h1>
                            <h1 className="w-2/6 text-xs md:text-sm font-bold text-center">
                                Question Name
                            </h1>
                            <h1 className="w-1/6 text-xs md:text-sm font-bold text-center">
                                Difficulty
                            </h1>
                            <h1 className="w-2/6 text-xs md:text-sm font-bold text-center">
                                Status
                            </h1>
                        </div>
                        <ScrollArea className="h-[60vh] rounded-md">
                            <div className="p-4">
                                {questions.map((question) => (
                                    <div
                                        key={question.slno}
                                        className="flex flex-row text-sm space-x-4 mb-2"
                                    >
                                        <p className=" w-1/6 text-center p-2">
                                            {question.slno}
                                        </p>
                                        <p className=" w-2/6 text-center p-2">
                                            {question.questionName}
                                        </p>
                                        <p
                                            className="w-1/6 text-center p-2"
                                            style={{
                                                color:
                                                    question.difficulty ===
                                                    "Easy"
                                                        ? "#27AE60"
                                                        : question.difficulty ===
                                                          "Medium"
                                                        ? "#F2994A"
                                                        : "#EB5757",
                                            }}
                                        >
                                            {question.difficulty}
                                        </p>
                                        <p
                                            className="w-2/6 text-center p-2"
                                            style={{
                                                color: (() => {
                                                    const percentage =
                                                        (question.casesPassed /
                                                            question.totalCases) *
                                                        100;
                                                    if (percentage <= 40)
                                                        return "#EB5757";
                                                    if (percentage < 100)
                                                        return "#F2994A";
                                                    return "#27AE60";
                                                })(),
                                            }}
                                        >
                                            {question.casesPassed}/
                                            {question.totalCases}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                    <div
                        style={{
                            background: `linear-gradient(0deg, rgba(57, 35, 78, 0.25), rgba(57, 35, 78, 0.25)),
                 linear-gradient(0deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03))`,
                        }}
                        className="w-[32vw] rounded-lg pl-7 pr-7"
                    >
                        <p className="text-2xl font-semibold border-b-2 border-white p-2 py-4 mb-4">
                            Leaderboard
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
