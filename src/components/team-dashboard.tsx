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
        <div className="flex flex-col bg-background-gradient text-text py-4 px-16 min-h-screen">
            <div className="p-2 justify-center items-center mb-4">
                <p className="text-2xl font-[Audiowide] underline underline-offset-4 decoration-white">
                    Round 1
                </p>
                <CountdownTimer getTimeUntil="" />
            </div>
            <div className="flex flex-row gap-4">
                <div className="flex flex-col w-1/3 gap-4">
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

                <DashboardBox className="flex flex-col justify-between w-full gap-4">
                    <p className="text-2xl font-bold border-b border-rcgrey/20 pb-2">
                        Questions
                    </p>
                    <ScrollArea className='w-full h-[60vh]'>
                        <table className='w-full table-auto border-separate border-spacing-y-2 border-spacing-x-0'>
                            <thead>
                                <tr>
                                    <th scope='col' className='text-xl'>Sl No</th>
                                    <th scope='col' className='text-xl'>Questions</th>
                                    <th scope='col' className='text-xl'>Difficulty</th>
                                    <th scope='col' className='text-xl'>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map((question) => (
                                    <tr key={question.slno} className='group cursor-pointer'>
                                        <td className="transition duration-200 group-hover:bg-rcgrey/20 group-hover:border-rcgrey/20 rounded-l-lg border-y border-l border-transparent w-1/6 text-center p-2">{question.slno}</td>
                                        <td className="transition duration-200 group-hover:bg-rcgrey/20 group-hover:border-rcgrey/20 border-y border-transparent w-2/6 text-center p-2">{question.questionName}</td>
                                        <td className={`${question.difficulty === 'Easy' ? 'text-rcgreen' : question.difficulty === 'Medium' ? 'text-rcorange' : 'text-rcred'} transition duration-200 group-hover:bg-rcgrey/20 group-hover:border-rcgrey/20 border-y border-transparent w-1/6 text-center p-2`}>
                                            {question.difficulty}
                                        </td>
                                        <td className={`${question.casesPassed <= 2 ? 'text-rcred' : question.casesPassed <= 4 ? 'text-rcorange' : 'text-rcgreen'}  transition duration-200 group-hover:bg-rcgrey/20 group-hover:border-rcgrey/20 border-y border-r border-transparent rounded-r-lg w-2/6 text-center p-2`}>
                                            {question.casesPassed}/{question.totalCases}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ScrollArea>
                </DashboardBox>
                <DashboardBox className="w-1/3">
                    <p className="text-2xl font-semibold border-b-2 border-white p-2 mb-4">
                        LeaderBoard
                    </p>
                </DashboardBox>
            </div>
        </div>
    );
};

export default Dashboard;
