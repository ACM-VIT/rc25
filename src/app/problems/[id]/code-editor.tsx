import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import createSubmission from '@/app/actions/create-submission';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/utils/judge0-langs';

const LANGUAGE_STORAGE_KEY = 'preferred-language' as const;
const CODE_STORAGE_KEY = 'code-snippets' as const;

interface Problem {
    id: string;
    title: string;
    description: string;
}

interface CodeEditorProps {
    problem: Problem;
    session: { user: { id: string }};
}

interface CodeSnippets {
  [key: string]: {
    [language: string]: string;
  }
}

const validateCode = (code: string, language: SupportedLanguage): string | null => {
    const validations: Record<SupportedLanguage, RegExp> = {
        'c': /int\s+solve\s*\(\s*\)/,
        'cpp': /void\s+solve\s*\(\s*\)/,
        'java': /class\s+Solution[\s\S]*public\s+void\s+solve\s*\(\s*\)/,
        'javascript': /function\s+solve\s*\(\s*\)/,
        'python': /def\s+solve\s*\(\s*\):/,
        'go': /func\s+solve\s*\(\s*\)/
    };

    const regex = validations[language];
    if (!regex.test(code)) {
        return `Missing or invalid ${language.toUpperCase()} solve function definition`;
    }
    return null;
};

export default function CodeEditor({ problem, session }: CodeEditorProps) {
    const [language, setLanguage] = useState<SupportedLanguage>(() => {
        if (typeof window === 'undefined') return 'c';
        return (localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage) || 'c';
    });

    const [code, setCode] = useState<string>(() => {
        if (typeof window === 'undefined') return SUPPORTED_LANGUAGES[language].defaultCode;
        const snippets: CodeSnippets = JSON.parse(localStorage.getItem(CODE_STORAGE_KEY) || '{}');
        return snippets[problem.id]?.[language] || SUPPORTED_LANGUAGES[language].defaultCode;
    });

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submissionStatus, setSubmissionStatus] = useState('');
    // const [streamData, setStreamData] = useState(""); // Add this state

    useEffect(() => {
        const snippets: CodeSnippets = JSON.parse(localStorage.getItem(CODE_STORAGE_KEY) || '{}');
        const savedCode = snippets[problem.id]?.[language];
        setCode(savedCode || SUPPORTED_LANGUAGES[language].defaultCode);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }, [language, problem.id]);

    const handleSubmit = async () => {
        if (!session?.user?.id) {
            setError('Please login to submit');
            return;
        }

        // Validate the raw code
        const validationError = validateCode(code, language);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            setSubmissionStatus('Submitting...');

            const result = await createSubmission({
                code: code,
                problemId: problem.id,
                userId: session.user.id,
                language
            });

            console.log("result: ",result);


            if (result.success && result.submission) {
                setSubmissionStatus('Submitted successfully!');
                const finalResult = await fetch(`/edge?submissionId=${result.submission.id}&token=${result.token}`, {
                    method: 'GET'
                });

                const reader = finalResult.body?.getReader();
                const decoder = new TextDecoder();

                if (reader) {
                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            const chunk = decoder.decode(value);
                            console.log('Received chunk:', chunk);
                            // setStreamData(prev => prev + chunk);
                        }
                    } catch (error) {
                        console.error('Error reading stream:', error);
                    } finally {
                        reader.releaseLock();
                    }
                }

                

                console.log('Final result');
            }
            if (!result.success) {
                setError(result.error || 'Submission failed');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const languages = Object.entries(SUPPORTED_LANGUAGES).map(([value, data]) => ({
        value: value as SupportedLanguage,
        label: data.name.split(' ')[0] 
    }));

    return (
        <div className="absolute right-0 w-[55vw] h-[50vh] border rounded-lg shadow-lg overflow-hidden mt-2 mr-20">
            <div className="w-full h-[5vh] rounded-t-lg flex items-center justify-between px-4 text-white"
                style={{
                    background: "radial-gradient(circle, #241F2A 80%, #39234E 110%)",
                }}>
                <span className="font-medium">Code</span>
                <div className="flex items-center space-x-3 relative">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            onKeyUp={(e) => e.key === 'Enter' && setDropdownOpen(!dropdownOpen)}
                            onKeyDown={(e) => e.key === ' ' && setDropdownOpen(!dropdownOpen)}
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
                                    <button
                                        key={lang.value}
                                        onClick={() => {
                                            setLanguage(lang.value);
                                            setDropdownOpen(false);
                                        }}
                                        onKeyUp={(e) => e.key === 'Enter' && setLanguage(lang.value)}
                                        onKeyDown={(e) => e.key === ' ' && setLanguage(lang.value)}
                                        className="px-2 py-1 text-white cursor-pointer hover:bg-gray-700 w-full text-left"
                                        type="button"
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </ul>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-3 py-1 rounded-md text-xs font-semibold bg-black text-white border-2 border-yellow-500 hover:bg-[#262626] disabled:opacity-50"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>
            
            {error && (
                <div className="absolute top-[5vh] w-full p-2 bg-red-100 text-red-700 text-sm">
                    {error}
                </div>
            )}
            
            {submissionStatus && !error && (
                <div className="absolute top-[5vh] w-full p-2 bg-green-100 text-green-700 text-sm">
                    {submissionStatus}
                </div>
            )}

            <Editor
                height="calc(100% - 5vh)"
                theme="vs-dark"
                value={code}
                onChange={(value) => {
                    if (!value) return;
                    setCode(value);
                    const snippets: CodeSnippets = JSON.parse(localStorage.getItem(CODE_STORAGE_KEY) || '{}');
                    snippets[problem.id] = {
                        ...snippets[problem.id],
                        [language]: value
                    };
                    localStorage.setItem(CODE_STORAGE_KEY, JSON.stringify(snippets));
                }}
                language={language}
                className="rounded-b-lg"
            />
        </div>
    );
}
