import { FaCrown } from "react-icons/fa";
import React from "react";
import { ScrollArea, ScrollAreaViewport, ScrollAreaScrollbar, ScrollAreaThumb } from "@radix-ui/react-scroll-area";

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
    <div className="h-full bg-transparent overflow-auto justify-center m-2 backdrop-blur-md">
        <p className="text-4xl text-white bg-transparent border-b-2 pb-4 mb-4 text-center h-[10vh]">
            Leaderboard
        </p>
        <div className="flex justify-center text-white mb-2 px-1 text-center w-[85vw] h-[8vh]">
            <span className="w-1/2 text-2xl font-bold text-center">Rank</span>
            <span className="w-1/4 text-2xl font-bold text-center">Team Name</span>
            <span className="w-1/2 text-2xl font-bold text-center">Questions Completed</span>
            <span className="w-1/4 text-2xl font-bold text-center">Score</span>
        </div>
        <ScrollArea className="justify-center h-[78vh]">
            <ScrollAreaViewport>
                <ul className="space-y-3 px-1">
                    {dummyLeaderboard.map((team, index) => (
                        <li key={team.id} className="flex w-3/4 mx-auto bg-slate-700 bg-opacity-50 rounded-lg justify-between text-white items-center h-[7.5vh]">
                            <div className="flex w-1/6 p-4 items-center justify-center">
                                {index === 0 && (
                                    <FaCrown size={28} className="text-yellow-500" />
                                )}
                                {index === 1 && <FaCrown size={28} className="text-gray-400" />}
                                {index === 2 && (
                                    <FaCrown size={28} className="text-[#CD7F32]" />
                                )}
                                {index > 2 && (
                                    <span className="text-white">{index + 1}</span>
                                )}
                            </div>
                            <span className="w-1/3 font-medium truncate text-center uppercase">{team.name}</span>
                            <span className="w-1/3 text-center">{team.questionsCompleted}/{team.totalQuestions}</span>
                            <span className="w-1/6 text-center font-semibold">{team.score} pts</span>
                        </li>
                    ))}
                </ul>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar orientation="vertical">
                <ScrollAreaThumb className="bg-gray-500 rounded-full" />
            </ScrollAreaScrollbar>
        </ScrollArea>
    </div>
);

export default LiveLeaderboard;
