"use client"
import Navbar from "@/components/Navbar";
import React,{useState} from "react";
import {ScrollArea} from "@/components/ui/scroll-area";

const TeamSubmissions = ()=> {
    const teamdetails = Array.from({ length: 50 }).map((_, i) => {
        const slno = i + 1;
        const time = "12:00:00";
        const name = "Vansh Dhir";
        const problem = "Fibonnaci";
        const language = "Python";
        const questionSolved = 3;
        const totalQuestions = 5;
        return {
            slno,
            time,
            name,
            problem,
            language,
            questionSolved,
            totalQuestions,
        };
    });

    return (
        <>
            <div className="bg-[radial-gradient(110.8%_70.71%_at_50%_50%,_#0B0014_55.41%,_#18181B_100%)] min-h-screen justify-items-center">
                <Navbar name="John Doe" />
                <div className="text-left justify-center bg-[radial-gradient(110.8%_70.71%_at_50%_50%,_#0B0014_55.41%,_#18181B_100%)] p-4">
                    <div className="mb-4 justify-start">
                        <h1 className="font-[Audiowide] text-4xl font-bold underline text-left text-white">
                            Team Submissions
                        </h1>
                    </div>
                </div>
                <div className="text-white bg-[#2d1c3d] bg-opacity-70 w-[90vw] h-[70vh] rounded-lg overflow-auto">
                    <div className="flex flex-row border-b mr-2 ml-2 p-2 x">
                        <h1 className="w-1/6 text-center font-bold p-2">Sl.No</h1>
                        <h1 className="w-1/6 text-center font-bold p-2">Time</h1>
                        <h1 className="w-1/6 text-center font-bold p-2">Name</h1>
                        <h1 className="w-1/6 text-center font-bold p-2">Problem</h1>
                        <h1 className="w-1/6 text-center font-bold p-2">Language</h1>
                        <h1 className="w-1/6 text-center font-bold p-2">Status</h1>
                    </div>
                    <ScrollArea className="h-[70vh] rounded-md ">
                        <div className="pr-4">
                            {teamdetails.map((team) => (
                                <div key={team.slno} className="flex flex-row mr-2 ml-2 p-2">
                                    <p className="w-1/6 text-center p-2 ">
                                        {team.slno}
                                    </p>
                                    <p className="w-1/6  text-center  p-2">
                                        {team.time}
                                    </p>
                                    <p className="w-1/6  text-center p-2">
                                        {team.name}
                                    </p>
                                    <p className="w-1/6 text-center p-2">
                                        {team.problem}
                                    </p>
                                    <p className="w-1/6 text-center p-2">
                                        {team.language}
                                    </p>
                                    <p className="w-1/6 text-center p-2">
                                        {team.questionSolved}/{team.totalQuestions}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </>
    );
}

export default TeamSubmissions;
