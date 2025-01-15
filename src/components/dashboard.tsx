import type React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import CountdownTimer from "@/components/countdown-timer";
import DashboardBox from "@/components/DashboardBox";
import type { DashboardProps } from "@/types/dashboard"
import Link from "next/link";


const Dashboard: React.FC<DashboardProps> = ({ 
    teamDetails,
    leaderboard,
    questions,
    roundInfo 
}) => {
    return (
        <div>
            <div className="flex md:hidden">
                <h1 className="text-white">Phone pe code karega chutiye?</h1>
            </div>
            <div className="hidden md:flex flex-col w-full h-[90%] items-center gap-4 text-white p-4 pb-0">
                <div className="p-2 justify-center items-center">
                    <p className="font-bold text-2xl font-[Audiowide] underline underline-offset-4 decoration-white">
                        Round {roundInfo.number}
                    </p>
                </div>
                <div className="flex flex-row gap-5 w-[95%] h-[85%]">
                    <div className="flex flex-col h-full justify-between">
                        <DashboardBox className="flex flex-col max-h-1/2 p-6 shadow-lg rounded-lg text-white">
                            <p className="text-xl font-semibold border-b-2 text-center border-white pt-0 pb-4">
                                {teamDetails.name}
                            </p>
                            <ul className="space-y-3 pt-4 px-1">
                                {teamDetails.members.map(member => (
                                    <li key={member.id} className="flex justify-between">
                                        <p>{member.name || 'Anonymous'}</p>
                                        <p>{member.score} pts</p>
                                    </li>
                                ))}
                            </ul>
                        </DashboardBox>
                        <div className="w-full">
                            <CountdownTimer
                                getTimeUntil={roundInfo.end.toISOString()}
                            />
                        </div>
                    </div>

                    <div className="flex w-full flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
                        <DashboardBox className="w-full lg:w-[70%] p-7 pt-0 rounded-lg overflow-y-hidden overflow-x-auto">
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
                            <div className="space-y-4">
                                    {questions.map((question) => (
                                        <Link
                                            href={`/problems/${question.id}`}
                                            key={question.id}
                                            className="block" 
                                        >
                                            <div className="flex flex-row items-center rounded-lg bg-[#2C2C2C] hover:bg-[#383838] transition-colors">
                                                <p className="w-1/6 text-center p-2">
                                                    {question.slno}
                                                </p>
                                                <p className="w-2/6 text-center p-2">
                                                    {question.questionName}
                                                </p>
                                                <p
                                                    className="w-1/6 text-center p-2"
                                                    style={{
                                                        color:
                                                            question.difficulty === "Easy"
                                                                ? "#27AE60"
                                                                : question.difficulty === "Medium"
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
                                                            if (question.status === "Not Attempted") return "#EB5757";
                                                            const [passed, total] = question.status.split('/').map(Number);
                                                            const percentage = (passed / total) * 100;
                                                            if (percentage <= 40) return "#EB5757";
                                                            if (percentage < 100) return "#F2994A";
                                                            return "#27AE60";
                                                        })(),
                                                    }}
                                                >
                                                    {question.status}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </ScrollArea>
                        </DashboardBox>
                        <DashboardBox className="w-full max-h-[40%] overflow-y-auto lg:w-[30%] lg:max-h-full rounded-lg pl-7 pr-7">
                            <p className="text-2xl font-semibold border-b-2 border-white p-2 py-4 mb-4">
                                Leaderboard
                            </p>
                            <ul className="space-y-3 pt-4 px-1">
                                {leaderboard.map(team => (
                                    <li key={team.id} className="flex justify-between">
                                        <p>{team.name}</p>
                                        <p>{team.score} pts</p>
                                    </li>
                                ))}
                            </ul>
                        </DashboardBox>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
