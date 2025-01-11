import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import CountdownTimer from "@/components/countdown-timer";
import DashboardBox from './DashboardBox';
// import { Separator } from "@/components/ui/separator"


const Dashboard: React.FC = () => {
    const questions = Array.from({ length: 20 }).map((_, i) => ({
        slno: i + 1,
        questionName: `Question ${i + 1}`,
        difficulty: 'Easy',
        casesPassed: 3,
        totalCases: 5,
    }));

    return (
        <div className="flex flex-col bg-background-gradient min-h-screen text-text p-4">
            <div className="p-2 justify-center items-center mb-4">
                <p className="text-2xl font-[Audiowide] underline underline-offset-4 decoration-white">
                    Round 1
                </p>
                <CountdownTimer getTimeUntil="" />
            </div>
            <div className="flex flex-row gap-4">
                <div className="flex flex-col w-1/4 gap-4">
                    <DashboardBox className='flex flex-col relative gap-4 h-auto'>
                        <div className="absolute top-0 left-0 w-8 h-8 rounded-full blur-2xl bg-accent" />
                        <p className="text-2xl font-bold border-b border-b-rcgrey/20 pb-2">
                            &lt;Team Name&gt;
                        </p>
                        <ul className="space-y-3 text-lg px-4">
                            <li className="flex justify-between items-center">
                                <p>Team Member 1 </p>
                                <p className='text-sm'>99 pts</p>
                            </li>
                            <li className="flex justify-between items-center">
                                <p>Team Member 2</p>
                                <p className='text-sm'>99 pts</p>
                            </li>
                            <li className="flex justify-between items-center">
                                <p>Team Member 3</p>
                                <p className='text-sm'>99 pts</p>
                            </li>
                            <li className="flex justify-between items-center">
                                <p>Team Member 4</p>
                                <p className='text-sm'>99 pts</p>
                            </li>
                        </ul>
                        {/*</div>*/}
                    </DashboardBox>
                    <DashboardBox className='flex-1 flex flex-col relative overflow-hidden overflow-y-scroll'>
                        <div className="absolute bottom-0 left-0 w-8 h-8 rounded-full blur-2xl bg-accent" />
                        <p>News/Timeline</p>
                    </DashboardBox>
                </div>

                <div className="w-[50vw] bg-[#39234E] pl-7 pr-7 rounded-lg ml-7">
                    <p className="text-2xl font-semibold border-b-2 border-white p-2 mb-4">
                        Questions
                    </p>
                    <div className="flex flex-row border-b-2 pb-2 mb-4">
                        <h1 className="w-1/6 font-bold text-center">Sl No</h1>
                        <h1 className="w-2/6 font-bold text-center">Questions</h1>
                        <h1 className="w-1/6 font-bold text-center">Difficulty</h1>
                        <h1 className="w-2/6 font-bold text-center">Status</h1>
                    </div>
                    <ScrollArea className="h-[60vh] rounded-md">
                        <div className="p-4">
                            {questions.map((question) => (
                                <div key={question.slno} className="flex flex-row text-sm space-x-4 mb-2">
                                    <p className=" w-1/6 text-center p-2">{question.slno}</p>
                                    <p className=" w-2/6 text-center p-2">{question.questionName}</p>
                                    <p className=" w-1/6 text-center p-2">{question.difficulty}</p>
                                    <p className=" w-2/6 text-center p-2">
                                        {question.casesPassed}/{question.totalCases}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                <div className="w-[32vw] bg-[#39234E] rounded-lg pl-7 pr-7 ml-7">
                    <p className="text-2xl font-semibold border-b-2 border-white p-2 mb-4">
                        LeaderBoard
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
