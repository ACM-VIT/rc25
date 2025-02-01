import type React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import CountdownTimer from "@/components/countdown-timer";
import DashboardBox from "@/components/DashboardBox";
import type { DashboardProps } from "@/types/dashboard";
import Link from "next/link";
import { FaCrown } from "react-icons/fa";

const Dashboard: React.FC<DashboardProps> = ({
    teamDetails,
    leaderboard,
    questions,
    roundInfo,
}) => {
    const sortedLeaderboard = [...leaderboard].sort(
        (a, b) => b.score - a.score
    );

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "EASY":
                return "#27AE60";
            case "MEDIUM":
                return "#F2994A";
            case "HARD":
                return "#EB5757";
            default:
                return "#FF0000";
        }
    };

    const getStatusColor = (status: string) => {
        if (status === "Not Attempted") return "#EB5757";
        const statusParts = status.split("/").map(Number);
        if (statusParts.length === 2 && !isNaN(statusParts[0]) && !isNaN(statusParts[1])) {
            const [passed, total] = statusParts;
            const percentage = (passed / total) * 100;

            if (percentage <= 40) return "#EB5757";
            if (percentage < 100) return "#F2994A";
            return "#27AE60";
        }
        return "#FF0000";
    };

    return (
        <div>
            <div className="flex md:hidden min-h-screen items-center justify-center">
                <h1 className="text-white font-semibold text-lg w-[70%] text-center">
                    Oops! It looks like you&apos;re using a smaller screen.
                </h1>
            </div>
            <div className="hidden md:flex flex-col items-center justify-between w-full h-full text-white">
                <p className="font-bold text-2xl font-[Audiowide] underline underline-offset-4 decoration-white my-4">
                    Round {roundInfo.number}
                </p>
                <div className="flex flex-row w-full justify-around">
                    <div className="flex flex-col w-[20%]">
                        <DashboardBox className="flex flex-col p-6 mb-4 text-white h-[35%]">
                            <p className="text-xl font-semibold border-b-2 text-center border-white pb-4">
                                {teamDetails.name}
                            </p>
                            <ul className="space-y-3 pt-4 px-1">
                                {teamDetails.members.map((member) => (
                                    <li key={member.id} className="flex justify-between">
                                        <p className="flex">{member.name || "Anonymous"}</p>
                                    </li>
                                ))}
                            </ul>
                        </DashboardBox>

                        <DashboardBox className="p-6 text-center py-4 h-[28%]">
                            <CountdownTimer
                                getTimeUntil={roundInfo.end.toISOString()}
                            />
                        </DashboardBox>
                        <DashboardBox className="p-6 text-center mt-3 py-4 h-[30%]">
                            <div>
                                <p className="text-xl font-semibold border-b-2 text-center border-white pb-4">
                                    NEWS
                                </p>
                            </div>
                        </DashboardBox>

                    </div>
                    <div className="w-[50%]">
                        <DashboardBox>
                            <p className="text-2xl font-semibold border-b-2 border-white p-2 py-4 mb-4">
                                Questions
                            </p>
                            <div className="flex flex-row border-b-2 pb-4 w-full">
                                <h1 className="w-1/6 text-xl font-bold text-center">Sr. No</h1>
                                <h1 className="w-2/6 text-xl font-bold text-center">Question Name</h1>
                                <h1 className="w-1/6 text-xl font-bold text-center">Difficulty</h1>
                                <h1 className="w-2/6 text-xl font-bold text-center">Status</h1>
                            </div>
                            <ScrollArea className="h-[60vh] mt-4 rounded-md">
                                <div className="space-y-4">
                                    {questions.map((question) => (
                                        <Link href={`/problems/${question.id}`} key={question.id} className="block">
                                            <div className="flex flex-row items-center mt-4 rounded-lg hover:bg-[#383838] transition-colors">
                                                <p className="w-1/6 text-center p-2">{question.slno}</p>
                                                <p className="w-2/6 text-center p-2">{question.questionName}</p>
                                                <p
                                                    className="w-1/6 text-center p-2"
                                                    style={{ color: getDifficultyColor(question.difficulty) }}
                                                >
                                                    {question.difficulty}
                                                </p>
                                                <p
                                                    className="w-2/6 text-center p-2"
                                                    style={{ color: getStatusColor(question.status) }}
                                                >
                                                    {question.status}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </ScrollArea>
                        </DashboardBox>
                    </div>

                    <div className="w-[25%]">
                        <DashboardBox className="h-[93vh]">
                            <p className="text-2xl font-semibold border-b-2 border-white py-3 mb-4">
                                Leaderboard
                            </p>
                            <ul className="space-y-3 px-1">
                            {sortedLeaderboard.map((team, index) => (
                                <li key={team.id} className="flex justify-between items-center">
                                    <p className="flex w-2/3 mt-1 items-center gap-5">
                                        {index === 0 && <FaCrown className="text-yellow-500 mr-2" />}
                                        {index === 1 && <FaCrown className="text-gray-400 mr-2" />}  
                                        {index === 2 && <FaCrown className="text-[#CD7F32] mr-2" />}
                                        {index > 2 && <span className="mr-1">{index + 1}</span>}
                                        {team.name}
                                    </p>
                                    <p className="w-1/3 text-center gap-5">
                                        {team.score} pts
                                    </p>
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
