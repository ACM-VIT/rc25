import DashboardBox from "@/components/DashboardBox";
import { FaCrown } from "react-icons/fa";
import React from "react";
import { ScrollArea } from "@radix-ui/react-scroll-area";

const dummyLeaderboard = [
    { id: 1, name: "Team A", score: 100, questionsCompleted: 10, totalQuestions: 20 },
    { id: 2, name: "Team B", score: 90, questionsCompleted: 9, totalQuestions: 20 },
    { id: 3, name: "Team C", score: 80, questionsCompleted: 8, totalQuestions: 20 },
    { id: 4, name: "Team D", score: 70, questionsCompleted: 7, totalQuestions: 20 },
    { id: 5, name: "Team D", score: 70, questionsCompleted: 7, totalQuestions: 20 },
    { id: 6, name: "Team D", score: 70, questionsCompleted: 7, totalQuestions: 20 },
    { id: 7, name: "Team D", score: 70, questionsCompleted: 7, totalQuestions: 20 },
    { id: 8, name: "Team D", score: 70, questionsCompleted: 7, totalQuestions: 20 },
    { id: 9, name: "Team D", score: 70, questionsCompleted: 7, totalQuestions: 20 },
    { id: 10, name: "Team D", score: 70, questionsCompleted: 7, totalQuestions: 20 },
];

const LiveLeaderboard = () => (
    <DashboardBox className="h-full overflow-auto justify-center">
        <DashboardBox>
        <p className="text-2xl text-white border-b-2 border-rcgrey/20 pb-4 mb-4 text-center">
            Leaderboard
        </p>
        <div className="flex justify-between text-white mb-2 px-1 text-center">
            <span className="w-1/6 text-2xl font-bold">Rank</span>
            <span className="w-1/3 text-2xl font-bold">Team Name</span>
            <span className="w-1/3 text-2xl font-bold">Questions Completed</span>
            <span className="w-1/6 text-2xl font-bold">Score</span>
        </div>
        <ScrollArea className="justify-center">
            <ul className="space-y-3 px-1">
                {dummyLeaderboard.map((team, index) => (
                    <li key={team.id} className="flex justify-between text-white items-center">
                        <div className="flex w-1/6 items-center justify-center">
                            {index === 0 && (
                                <FaCrown className="text-yellow-500 mr-2" />
                            )}
                            {index === 1 && <FaCrown className="text-gray-400" />}
                            {index === 2 && (
                                <FaCrown className="text-[#CD7F32]" />
                            )}
                            {index > 2 && (
                                <span className="text-white">{index + 1}</span>
                            )}
                        </div>
                        <span className="w-1/3 font-medium truncate text-center">{team.name}</span>
                        <span className="w-1/3 text-center">{team.questionsCompleted}/{team.totalQuestions}</span>
                        <span className="w-1/6 text-center font-semibold">{team.score} pts</span>
                    </li>
                ))}
            </ul>
        </ScrollArea>
        </DashboardBox>
    </DashboardBox>
);

export default LiveLeaderboard;