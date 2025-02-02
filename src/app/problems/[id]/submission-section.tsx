"use client";
import React, {useState} from "react";
import {Submission} from "@prisma/client";

interface SubmissionSectionProps {
    isPending: boolean;
    submissions: Submission[];
    setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
}

const SubmissionSection: React.FC<SubmissionSectionProps> = ({isPending, submissions}) => {
    const [selectedOption, setSelectedOption] =
        useState<string>("best-submission");

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
    };

    const renderSubmission = (submission: Submission | null) => {
        if (isPending) return <p>Loading submissions...</p>;
        if (!submission) return <p>No submission found</p>;

        const passedCount = submission.testcasespassed.filter(Boolean).length;
        const totalTests = submission.testcasespassed.length;

        return (
            <div className="p-4 h-full">
                <div className="flex justify-between mb-2">
                    <span>Score: {submission.score}</span>
                </div>
                <div className="mb-2">
                    Passed: {passedCount}/{totalTests} test cases
                </div>
                <div className="text-xs overflow-auto max-h-[200px]">
                    <pre>{submission.code}</pre>
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
            <select
                value={selectedOption}
                onChange={handleChange}
                className=" p-2 mb-4 bg-black rounded"
                style={{
                    borderRadius: "8px",
                    border: "2px solid #CEB7FF",
                    background:
                        "linear-gradient(0deg, rgba(0, 0, 0, 0.70) 0%, rgba(0, 0, 0, 0.70) 100%), rgba(57, 35, 78, 0.60)",
                    backdropFilter: "blur(2.5px)",
                    WebkitBackdropFilter: "blur(2.5px)",
                }}
            >
                <option value="best-submission">Best Submission</option>
                <option value="latest-submission">Latest Submission</option>
            </select>

            {/*{selectedOption === "best-submission" &&*/}
            {/*    renderSubmission(submissions.best)}*/}

            {/*{selectedOption === "latest-submission" &&*/}
            {/*    renderSubmission(submissions.latest)}*/}
        </div>
    );
};

export default SubmissionSection;