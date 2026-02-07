"use client";
import type React from "react";
import {useState, useEffect} from "react";
import dynamic from "next/dynamic";
import animationData from "../../../../public/loading.json";
import { formula1Bold } from "@/lib/fonts";
import { Poppins } from "next/font/google";

const poppins = Poppins({ weight: ["400", "500", "600"], subsets: ["latin"] });

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import {ScrollArea} from "@/components/ui/scroll-area";
import type { EvalEnum } from "@/db/schema";

interface SubmissionSectionProps {
    isPending: boolean;
    submissions: SubmissionWithUser[];
    setSubmissions: React.Dispatch<React.SetStateAction<SubmissionWithUser[]>>;
}

export type SubmissionWithUser = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    evaluated: boolean;
    evaluationStatus: EvalEnum | null;
    testcasesPassed: number;
    totalTestcases: number;
    user: {
        name: string | null;
    };
};

const noSubmissionMessages = [
    "Ain't nobody dropped a thing yet. Either folks are slacking or they got cold feet.",
    "Ain't seen a single crate come in yet. Looks like the whole system's on a break.",
    "Oh dear! It appears there have been no transmissions received at this time.",
    "The Force remains still—no word has arrived as of yet.",
    "Noona submissions, peedunkee. Maybe da credits ain't flowin' yet.",
];

const getRandomMessage = () => {
    return noSubmissionMessages[
        Math.floor(Math.random() * noSubmissionMessages.length)
        ];
};

const SubmissionSection: React.FC<SubmissionSectionProps> = ({
                                                                 isPending,
                                                                 submissions,
                                                             }) => {
    const [randomMessage, setRandomMessage] = useState<string>("");

    useEffect(() => {
        submissions.sort((a, b) => {
            return a.updatedAt > b.updatedAt ? -1 : 1;
        });
        setRandomMessage(getRandomMessage());
    }, [submissions]); // Runs only once after mount

    const renderSubmission = (
        submission: SubmissionWithUser | null,
        isBest: boolean
    ) => {
        if (isPending) return <p>Loading submissions...</p>;
        if (!submission) return <p>No submission found</p>;
        if (!submission.evaluated)
            return (
                <div className="w-full border py-4 px-4 rounded-md border-[#EB5757] text-center">
                    Submission is being evaluated...
                </div>
            );



        const passedCount = submission.testcasesPassed;
        const totalTests = submission.totalTestcases;

        const safeTotal = totalTests > 0 ? totalTests : 1;

        return (
            <div
                className="w-full flex items-center justify-between border py-4 px-4 rounded-md "
                style={{
                    borderColor:
                        passedCount === totalTests
                            ? "#27AE60"
                            : passedCount / safeTotal <= 0.4
                                ? "#EB5757"
                                : "#F2994A",
                }}
            >
                <div className="flex flex-col items-start">
                    <span className={`font-bold ${formula1Bold.className}`}>{submission.user.name}</span>
                </div>
                <div className={`flex flex-col items-center justify-center gap-1 ${poppins.className}`}>
                    {submission.evaluationStatus === "ACCEPTED" && isBest && (
                        <span
                            className="m-0 px-1 py-0 text-[0.5rem] font-semibold text-purple-500 border border-purple-500 rounded-md">
                            Best Submission
                        </span>
                    )}
                    {submission.evaluationStatus === "COMPILATION_ERROR" ? (
                        <span className="text-red-400">Compile Error</span>
                    ) : submission.evaluationStatus?.startsWith("RUNTIME_ERROR") ? (
                        <span className="text-red-400">Runtime Error</span>
                    ) : (
                        <span>
                            {passedCount}/{totalTests} Test Cases Passed
                        </span>
                    )}
                </div>
                <div className={poppins.className}>
                    {new Date(submission.updatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                    })}
                </div>
            </div>
        );
    };

    return (
    <div className="rounded-lg flex flex-col h-full min-h-0 border-2 border-[#A7282D] hover:border-primary overflow-hidden"
        style={{
            background: 'linear-gradient(to bottom, #000000 70%, #2A2A2A)'
        }}>
        <div
            className="flex-1 min-h-0 rounded-lg p-4 text-white flex flex-col overflow-hidden"
            style={{
                borderRadius: "8px",
                backdropFilter: "blur(2.5px)",
                WebkitBackdropFilter: "blur(2.5px)",
            }}
        >
            {submissions.length === 0 ? (
                <div className="w-full flex items-center justify-center border-[#EB5757] border p-2 rounded-md">
                    {randomMessage}
                </div>
            ) : submissions.length === 1 && !submissions[0].evaluated ? (
                <div className="flex-1 min-h-0 border-2 border-[#EB5757] px-4 py-2 rounded-md flex flex-col overflow-hidden">
                    <p className="text-[#F8CC22] font-outfit text-center py-2 shrink-0">
                        The first record is now under scrutiny. The Force will reveal its merit.
                    </p>
                    <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
                        <Lottie
                            animationData={animationData}
                            loop
                            autoplay
                            style={{ maxWidth: "200px", maxHeight: "100%", width: "auto", height: "auto" }}
                        />
                    </div>
                </div>
            ) : (
                <ScrollArea className="flex-1">
                    <div className="space-y-4">
                        {submissions.map((submission, index) => (
                            <div key={submission.id}>
                                {renderSubmission(
                                    submission,
                                    index ===
                                    submissions.findIndex(
                                        (s) =>
                                            s.testcasesPassed ===
                                            Math.max(
                                                ...submissions.map(
                                                    (sub) =>
                                                        sub.testcasesPassed
                                                )
                                            )
                                    )
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            )}
        </div>
    </div>
);
};

export default SubmissionSection;
