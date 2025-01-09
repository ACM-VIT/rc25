import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Prisma } from '@prisma/client';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'; 
import ProblemGetPayload = Prisma.ProblemGetPayload;

export default function QuestionDisplay({ problem }: { problem: any }) {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('C');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleSubmit = () => {
        console.log('Submitting code:', code);
        console.log('Selected language:', language);
    };

    const languages = [
        { value: 'c', label: 'C' },
        { value: 'cpp', label: 'C++' },
        { value: 'java', label: 'Java' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
        { value: 'go', label: 'Go' },
    ];

    return (
        <div
            className="absolute right-0 w-[55vw] h-[50vh] border rounded-lg shadow-lg overflow-hidden mt-2 mr-20"
        >
            <div
                className="w-full h-[5vh] rounded-t-lg flex items-center justify-between px-4 text-white"
                style={{
                    background: "radial-gradient(circle, #241F2A 80%, #39234E 110%)",
                }}
            >
                <span className="font-medium">Code</span>
                <div className="flex items-center space-x-3 relative">
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="text-xs rounded-md px-2 py-1 flex items-center justify-between text-white focus:outline-none focus:ring-0"
                            style={{
                                background: "radial-gradient(circle, #241F2A 80%, #39234E 110%)",
                                border: "1px solid white",
                            }}
                        >
                            {languages.find((lang) => lang.value === language)?.label || 'Language'}
                            {dropdownOpen ? (
                                <FiChevronUp className="ml-2" />
                            ) : (
                                <FiChevronDown className="ml-2" />
                            )}
                        </button>
                        {dropdownOpen && (
                            <ul
                                className="absolute top-full mt-1 w-32 bg-gray-900 rounded-md shadow-lg z-10"
                                style={{
                                    background: "radial-gradient(circle, #241F2A 80%, #39234E 110%)",
                                }}
                            >
                                {languages.map((lang) => (
                                    <li
                                        key={lang.value}
                                        onClick={() => {
                                            setLanguage(lang.value);
                                            setDropdownOpen(false);
                                        }}
                                        className="px-2 py-1 text-white cursor-pointer hover:bg-gray-700"
                                    >
                                        {lang.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="px-3 py-1 rounded-md text-xs font-semibold bg-black text-white border-2 border-yellow-500 hover:bg-[#262626]"
                    >
                        Submit
                    </button>
                </div>
            </div>
            <Editor
                height="calc(100% - 5vh)"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value ?? '')}
                language={language}
                className="rounded-b-lg"
            />
        </div>
    );
}
