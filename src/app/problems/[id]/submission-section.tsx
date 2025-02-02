"use client";
import React, { useState, useEffect } from "react";
import { Submission } from "@prisma/client";
import Lottie from "lottie-react";
import animationData from "../../../../public/loading.json";

interface SubmissionSectionProps {
    isPending: boolean;
    submissions: Submission[];
    setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
}

const noSubmissionMessages = [
    "Ain’t nobody dropped a thing yet. Either folks are slacking or they got cold feet.",
    "Ain’t seen a single crate come in yet. Looks like the whole system’s on a break.",
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
    console.log("Submissions array:", submissions);
    console.log("Submissions length:", submissions.length);

    const [selectedOption, setSelectedOption] =
        useState<string>("best-submission");
    const [randomMessage, setRandomMessage] = useState<string>("");

    useEffect(() => {
        setRandomMessage(getRandomMessage());
        console.log(submissions);
    }, []); // Runs only once after mount

    const renderSubmission = (submission: Submission | null) => {
        if (isPending) return <p>Loading submissions...</p>;
        if (!submission) return <p>No submission found</p>;

        const passedCount = submission.testcasespassed.filter(Boolean).length;
        const totalTests = submission.testcasespassed.length;

        return (
            <div className="w-full flex items-center justify-between border-[#EB5757] border-1 py-4 px-4 rounded-md bg-[rgba(255,255,255,0.05)]">
                <div className="flex justify-between">
                    <span>Score: {submission.userId}</span>
                </div>
                <div className="">
                    {passedCount}/{totalTests} Test Cases Passed
                </div>
                <div className="">
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
        <div
            className="w-full rounded-lg p-4 bg-black/50 text-white h-full"
            style={{
                borderRadius: "8px",
                border: "2px solid #CEB7FF",
                background:
                    "linear-gradient(0deg, rgba(0, 0, 0, 0.70) 0%, rgba(0, 0, 0, 0.70) 100%), rgba(57, 35, 78, 0.60)",
                backdropFilter: "blur(2.5px)",
                WebkitBackdropFilter: "blur(2.5px)",
            }}
        >
            {submissions.length === 0 ? (
                // Case 1: No submissions so far
                <div className="w-full flex items-center justify-center border-[#EB5757] border-1 py-2 rounded-md bg-[rgba(255,255,255,0.05)]">
                    <h1>No submissions so far</h1>
                </div>
            ) : submissions.length === 1 && !submissions[0].evaluated ? (
                // Case 2: No previous submissions, first submission created and still evaluating
                <div className="w-full h-full border-2 border-[#EB5757] px-4 py-2 rounded-md bg-[rgba(255,255,255,0.05)]">
                    <p className="text-[#F8CC22] font-outfit text-center">
                        The first record is now under scrutiny. The Force will
                        reveal its merit.
                    </p>
                    <div className="h-full">
                        <Lottie
                            animationData={animationData}
                            loop
                            autoplay
                            height={10}
                            width={10}
                            className="w-full h-[95%]"
                        />
                    </div>
                </div>
            ) : submissions.length > 1 &&
              submissions.filter((sub) => !sub.evaluated).length === 1 ? (
                // Case 4: One previous solution and second solution being evaluated
                <p>
                    One previous solution exists, second solution is being
                    evaluated...
                </p>
            ) : submissions.length > 1 ? (
                // Case 5: General case (Multiple submissions visible)
                <p>Multiple submissions available</p>
            ) : (
                // Default case: Render the latest submission
                renderSubmission(submissions[0])
            )}
        </div>
    );
};

export default SubmissionSection;
