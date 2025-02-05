"use client";
import type React from "react";
import { useState, useEffect } from "react";
import type { Prisma, Submission } from "@prisma/client";
import Lottie from "lottie-react";
import animationData from "../../../../public/loading.json";
import { ScrollArea } from "../../../components/ui/scroll-area";

interface SubmissionSectionProps {
    isPending: boolean;
    submissions: SubmissionWithUser[];
    setSubmissions: React.Dispatch<React.SetStateAction<SubmissionWithUser[]>>;
}

export type SubmissionWithUser = Prisma.SubmissionGetPayload<{
    include: { user: { select: { name: true } } };
}>;

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
                <div className="w-full border-1 py-4 px-4 rounded-md border-[#EB5757] text-center">
                    Submission is being evaluated...
                </div>
            );

        const passedCount = submission.testcasespassed.filter(Boolean).length;
        const totalTests = submission.testcasespassed.length;

        return (
            <div
                className="w-full flex items-center justify-between border-1 py-4 px-4 rounded-md "
                style={{
                    borderColor:
                        passedCount === totalTests
                            ? "#27AE60"
                            : passedCount / totalTests <= 0.4
                            ? "#EB5757"
                            : "#F2994A",
                }}
            >
                <div className="flex items-center space-x-2">
                    <span className="font-bold">{submission.user.name}</span>
                    {isBest && (
                        <span className="m-0 px-2 py-1 text-xs font-semibold text-purple-500 border border-purple-500 rounded-md">
                            Best Submission
                        </span>
                    )}
                </div>
                <div className="flex flex-col items-center justify-between gap-2 space-x-2">
                    <span>
                        {passedCount}/{totalTests} Test Cases Passed
                    </span>
                </div>
                <div>
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
        <div className="rounded-lg flex flex-col h-full bg-black/50 border-2 border-weirdPurple hover:border-primary">
            <ScrollArea className="flex-grow h-full w-full rounded-lg border-0">
                <div
                    className="w-full rounded-lg p-4 text-white h-full overflow-y-auto"
                    style={{
                        borderRadius: "8px",
                        backdropFilter: "blur(2.5px)",
                        WebkitBackdropFilter: "blur(2.5px)",
                    }}
                >
                    {submissions.length === 0 ? (
                        // Case 1: No submissions so far
                        <div className="w-full flex items-center justify-center border-[#EB5757] border-1 py-2 rounded-md">
                            {randomMessage}
                        </div>
                    ) : submissions.length === 1 &&
                      !submissions[0].evaluated ? (
                        // Case 2: No previous submissions, first submission created and still evaluating
                        <div className="w-full h-full border-2 border-[#EB5757] px-4 py-2 rounded-md">
                            <p className="text-[#F8CC22] font-outfit text-center">
                                The first record is now under scrutiny. The
                                Force will reveal its merit.
                            </p>
                            <div className="h-full flex items-center justify-center">
                                <Lottie
                                    animationData={animationData}
                                    loop
                                    autoplay
                                    style={{ width: "25%" }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 overflow-y-auto">
                            {submissions.map((submission, index) => (
                                <div key={submission.id}>
                                    {renderSubmission(
                                        submission,
                                        index ===
                                            submissions.findIndex(
                                                (s) =>
                                                    s.testcasespassed.filter(
                                                        Boolean
                                                    ).length ===
                                                    Math.max(
                                                        ...submissions.map(
                                                            (sub) =>
                                                                sub.testcasespassed.filter(
                                                                    Boolean
                                                                ).length
                                                        )
                                                    )
                                            ) // The submission with the highest score gets the "Best Submission" tag
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default SubmissionSection;
