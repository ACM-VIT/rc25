import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import CountdownTimer from "@/components/countdown-timer";
import { Crown } from 'lucide-react';
// import { Separator } from "@/components/ui/separator"


const Dashboard: React.FC = () => {
    const questions = Array.from({ length: 20 }).map((_, i) => ({
        slno: i + 1,
        questionName: `Question ${i + 1}`,
        difficulty: 'Easy',
        casesPassed:3,
        totalCases:5,
    }));
    const teams = Array.from({ length: 50 }).map((_, i) => {
        const slno = i + 1;
        let icon = null;

        if (slno === 1) {
            icon = <Crown color="#F8CC22" />;
        } else if (slno === 2) {
            icon = <Crown color="#BDBDBD" />;
        } else if (slno === 3) {
            icon = <Crown color="#F2994A" />;
        }else{
            icon=i+1;
        }

        return {
            slno,
            icon,
            teamName: `Team ${slno}`,
            pts: '89pts',
        };
    });

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
                        className="flex flex-col p-6 shadow-lg rounded-lg text-white  bg-[#39234E]">
                        <div className="hidden lg:block absolute top-[32%]  left-[2%] rounded-full  w-[84px] h-[60px] rounded-full blur-[50px] bg-none transition duration-1000 bg-[#F8CC22]"/>
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
                        {/*</div>*/}
                    </div>
                    <div
                        className="flex relative flex-col p-4 h-[40vh] justify-center shadow-lg rounded-lg mt-4 text-white text-center bg-[radial-gradient(at_1%_1%,_#F8CC22,_#39234E_1%)]">
                        <p>News/Timeline</p>
                        <div className="hidden lg:block absolute bottom-0 left-2 w-[100px] h-[40px] rounded-full blur-[50px] bg-none transition duration-1000 bg-[#F8CC22]"/>
                    </div>
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
                        <div className="p-0">
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
                    <div>
                        <ScrollArea className="h-[60vh] rounded-md">
                            <div className="pr-4">
                                {teams.map((team) => (
                                    <div key={team.slno} className="flex flex-row text-sm space-x-4 mb-2">
                                        <p className=" w-1/6 text-center p-2"> {team.icon} </p>
                                        <p className=" w-1/2 text-center p-2">
                                            {team.teamName}
                                        </p>
                                        <p className=" w-1/6 text-center p-2">
                                            {team.pts}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <div>
                            {/*TODO: Add user team details*/}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
