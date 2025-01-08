import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"


const Dashboard: React.FC = () => {
    const questions = Array.from({ length: 20 }).map((_, i) => ({
        slno: i + 1,
        questionName: `Question ${i + 1}`,
        difficulty: 'Easy',
        casesPased:3,
        totalCases:5,
    }));

    return (
        <div className="flex flex-col bg-[#0B0014] min-h-screen text-white p-4">
            <div className="p-2 justify-center items-center mb-4">
                <p className="font-bold text-2xl font-[Audiowide] underline underline-offset-4 decoration-white">
                    Round 1
                </p>
            </div>
            <div className="flex flex-row">
                <div className="flex flex-col w-1/4">
                    <div
                        className="flex flex-col p-6 shadow-lg rounded-lg text-white bg-[radial-gradient(at_1%_1%,_#F8CC22,_#39234E_1%)]">
                        <p className="text-lg font-semibold text-center border-b border-white pb-2 mb-3">
                            Team Name
                        </p>
                        <ul className="space-y-3">
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
                    <div
                        className="flex flex-col p-4 h-[40vh] justify-center shadow-lg rounded-lg mt-4 text-white text-center bg-[radial-gradient(at_1%_1%,_#F8CC22,_#39234E_1%)]">
                        <p>News/Timeline</p>
                    </div>
                </div>

                <div className="w-[50vw] bg-[#39234E] pl-7 pr-7 rounded-lg ml-7">
                    <p className="text-lg font-semibold text-center border-b-2 border-white p-2 mb-4">
                        Questions
                    </p>
                    <div className="flex flex-row border-b-2 pb-2 mb-4">
                        <h1 className="w-1/2 text-center">Sl No</h1>
                        <h1 className=" w-1/2 text-center">Questions</h1>
                        <h1 className="w-1/3 text-center">Difficulty</h1>
                        <h1 className="w-2/3 text-center">Status</h1>
                    </div>
                    <ScrollArea className="h-[60vh] rounded-md ">
                        <div className="p-4">
                            {questions.map((question) => (
                                <div key={question.slno} className="flex flex-row text-sm space-x-4 mb-2">
                                    <p className=" bg-amber-300 w-1/4 text-center p-2">{question.slno}</p>
                                    <p className=" bg-amber-300 w-3/4 text-center p-2">{question.questionName}</p>
                                    <p className="bg-amber-300 w-1/3 text-center p-2">{question.difficulty}</p>
                                    <p className="bg-amber-300 w-1/4 text-center p-2">{question.casesPased}/{question.totalCases}</p>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                <div className="w-[35vw] bg-[#39234E] rounded-lg ml-7">
                    <p className="text-lg font-semibold text-center border-b-2 border-white p-4 mb-4">
                        Leaderboard
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
