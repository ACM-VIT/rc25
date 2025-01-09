import React, { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '../ui/seperator';
import { Prisma } from '@prisma/client';
import ProblemGetPayload = Prisma.ProblemGetPayload;

export default function QuestionDisplay({ problem }: { problem: any }) {
    const [pending, startTransition] = useTransition();
    const [input, setInput] = React.useState('');
    const [output, setOutput] = React.useState('');

    return (
        <div
            className="h-full rounded-[10px] p-3 mt-5 w-[45vw]"
            style={{
                background: "radial-gradient(circle, #241F2A 80%, #39234E 110%)",
            }}
        >
            <div className="flex flex-col h-full justify-between">
                <div className="text-white text-lg font-semibold mb-4">
                    Terminal
                </div>
                <hr className="border-t-2 border-gray-700 w-full mb-2" />
                <div className="flex flex-row justify-between h-[75%] rounded-[10px]">
                    <div className="flex flex-col w-1/2 px-4">
                        <div className="relative h-full">
                            <h3 className="absolute top-2 left-4 text-sm font-semibold text-white">
                                Input
                            </h3>
                            <Button
                                className="absolute top-3  right-4 bg-black text-white border-2 border-yellow-500 px-3 py-1 rounded-md text-xs hover:bg-[#262626]"
                                onClick={() => {
                                    startTransition(() => {
                                        setOutput('Running...');
                                        setTimeout(() => setOutput('Execution completed.'), 2000);
                                    });
                                }}
                                disabled={pending}
                            >
                                {pending ? 'Running...' : 'Run'}
                            </Button>
                            <textarea
                                className="w-full h-[100%] mt-2 bg-[#3C3C46] text-white p-4 rounded-[10px] resize-none focus:outline-none placeholder:text-sm"
                                style={{
                                    background: "radial-gradient(circle, #36253D 80%, #39234E 110%)",
                                }}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter Your Input"
                            />
                        </div>
                    </div>
                    <Separator orientation="vertical" />
                    <div className="flex flex-col w-1/2 px-4">
                        <div className="relative h-full">
                            <h3 className="absolute top-2 left-4 text-sm font-semibold text-white">
                                Output
                            </h3>
                            <textarea
                                className="w-full h-[100%] mt-2 bg-[#3C3C46] text-white p-4 rounded-[10px] resize-none focus:outline-none placeholder:text-sm"
                                style={{
                                    background: "radial-gradient(circle, #36253D 80%, #39234E 110%)",
                                }}
                                value={output}
                                readOnly
                                placeholder="Output here"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
