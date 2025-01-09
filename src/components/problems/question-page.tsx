'use client';
import React, { useState } from 'react';
import { FiArrowLeft, FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi'; // Import arrow icons
import CodeEditor from './code-editor';
import QuestionDisplay from './question-display';
import Navbar from '../Navbar';
import WebRunner from './web-runner';

const testProblems = [
    {
        id: 1,
        title: 'Question 1',
        description: 'This is the description for Question 1.',
        round: 1,
        win_dl: 'https://example.com/win1',
        mac_dl: 'https://example.com/mac1',
        lin_dl: 'https://example.com/lin1',
        maxScore: 100,
        difficulty: 'Easy',
    },
    {
        id: 2,
        title: 'Question 2',
        description: 'This is the description for Question 2.',
        round: 2,
        win_dl: 'https://example.com/win2',
        mac_dl: 'https://example.com/mac2',
        lin_dl: 'https://example.com/lin2',
        maxScore: 150,
        difficulty: 'Medium',
    },
    {
        id: 3,
        title: 'Question 3',
        description: 'This is the description for Question 3.',
        round: 3,
        win_dl: 'https://example.com/win3',
        mac_dl: 'https://example.com/mac3',
        lin_dl: 'https://example.com/lin3',
        maxScore: 200,
        difficulty: 'Hard',
    },
    {
        id: 4,
        title: 'Question 4',
        description: 'This is the description for Question 4.',
        round: 3,
        win_dl: 'https://example.com/win3',
        mac_dl: 'https://example.com/mac3',
        lin_dl: 'https://example.com/lin3',
        maxScore: 500,
        difficulty: 'Easy',
    },
];

export default function QuestionPage() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentProblem = testProblems[currentIndex];

    const handleNext = () => {
        if (currentIndex < testProblems.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    return (
        <div
            className="min-h-screen"
            style={{
                background: 'radial-gradient(circle, #18181B 55%, #08000F 100%)',
            }}
        >
            <Navbar name="User Name" />
            <hr className="border-t-2 border-gray-700 w-full " />

            <div className="w-[90vw] h-[90vh] rounded-[10px] flex flex-col gap-2">
                <div className="flex ml-10 mt-5">
                    <h1 className="text-white text-4xl font-bold underline">{currentProblem.title}</h1>

                    <div className="flex gap-2 absolute right-2 items-center">
                        <button
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            className={`px-3 py-1 rounded-md text-xs border-2 border-[#9B52E0] bg-black text-white ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                        >
                            <FiChevronLeft className="inline" />
                            Previous
                        </button>
                        <div className="flex gap-2">
                            {testProblems.slice(0, 3).map((_, index) => (
                                <div
                                    key={index}
                                    className={`px-3 py-1 rounded-md text-xs border-2 text-white font-bold ${currentIndex === index ? 'border-yellow-500' : 'border-[#9B52E0]'}`}
                                >
                                    {index + 1}
                                </div>
                            ))}
                            {testProblems.length > 3 && currentIndex >= 3 && (
                                <div
                                    className={`px-3 py-1 rounded-md text-xs border-2 text-white font-bold ${currentIndex === 3 ? 'border-yellow-500' : 'border-[#9B52E0]'}`}
                                >
                                    {currentIndex + 1}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={currentIndex === testProblems.length - 1}
                            className={`px-3 py-1 rounded-md text-xs font-semibold border-[#9B52E0] border-2 text-white ${currentIndex === testProblems.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                        >
                            Next
                            <FiChevronRight className="inline" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-4 flex-grow">
                    <div className="w-1/2 h-full">
                        <QuestionDisplay problem={currentProblem} />
                    </div>
                    <div className="w-1/2 h-full flex flex-col gap-4">
                        <div className="h-[60%]">
                            <CodeEditor problem={currentProblem} />
                        </div>
                        <div className="h-[30%]">
                            <WebRunner problem={currentProblem} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
