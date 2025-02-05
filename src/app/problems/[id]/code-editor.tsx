import React, {useState, useEffect, useTransition} from "react";
import Editor from "@monaco-editor/react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import createSubmission from "@/app/actions/create-submission";
import {
    SUPPORTED_LANGUAGES,
    type SupportedLanguage,
} from "@/utils/judge0-langs";
import {Prisma} from "@prisma/client";

const LANGUAGE_STORAGE_KEY = "preferred-language" as const;
const CODE_STORAGE_KEY = "code-snippets" as const;

type SubmissionWithUser = Prisma.SubmissionGetPayload<{
    include: {user: {select: {name: true}}}
}>

interface Problem {
    id: string;
    title: string;
    description: string;
}

interface CodeEditorProps {
    problem: Problem;
    session: { user: { id: string } };
    setStatusRibbon: React.Dispatch<React.SetStateAction<StatusRibbonProps>>;
    statusRibbon: StatusRibbonProps;
    setSubmissions: React.Dispatch<React.SetStateAction<SubmissionWithUser[]>>;
}

interface SubmittedStatusRibbonProps {
    type: "submitted";
}

interface EvaluationStatusRibbonProps {
    type: "evaluation";
    passed: number;
    total: number;
}

interface ErrorStatusRibbonProps {
    type: "error";
    message: string;
}

export type StatusRibbonProps = SubmittedStatusRibbonProps | EvaluationStatusRibbonProps | ErrorStatusRibbonProps | null;

interface CodeSnippets {
    [key: string]: {
        [language: string]: string;
    };
}

const validateCode = (
    code: string,
    language: SupportedLanguage
): string | null => {
    const validations: Record<SupportedLanguage, RegExp> = {
        c: /int\s+solve\s*\(\s*\)/,
        cpp: /void\s+solve\s*\(\s*\)/,
        java: /class\s+Solution[\s\S]*public\s+void\s+solve\s*\(\s*\)/,
        javascript: /function\s+solve\s*\(\s*\)/,
        python: /def\s+solve\s*\(\s*\):/,
        go: /func\s+solve\s*\(\s*\)/,
        rust: /fn\s+solve\s*\(\s*\)/,
    };

    const regex = validations[language];
    if (!regex.test(code)) {
        return `Missing or invalid ${language.toUpperCase()} solve function definition`;
    }
    return null;
};

export default function CodeEditor({ problem, session, setStatusRibbon, statusRibbon, setSubmissions }: CodeEditorProps) {
    const [language, setLanguage] = useState<SupportedLanguage>("c");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage;
            if (storedLanguage) {
                setLanguage(storedLanguage);
            }
        }
    }, []);

    const [code, setCode] = useState<string>(() => {
        if (typeof window === "undefined")
            return SUPPORTED_LANGUAGES[language].defaultCode;
        const snippets: CodeSnippets = JSON.parse(
            localStorage.getItem(CODE_STORAGE_KEY) || "{}"
        );
        return (
            snippets[problem.id]?.[language] ||
            SUPPORTED_LANGUAGES[language].defaultCode
        );
    });

    const [isPending, startTransition] = useTransition()
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const setError = (message: string) => {
        setStatusRibbon({ type: "error", message });
    }
    useEffect(() => {
        const snippets: CodeSnippets = JSON.parse(
            localStorage.getItem(CODE_STORAGE_KEY) || "{}"
        );
        const savedCode = snippets[problem.id]?.[language];
        setCode(savedCode || SUPPORTED_LANGUAGES[language].defaultCode);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }, [language, problem.id]);

    const handleSubmit = async () => {
        if (!session?.user?.id) {
            setError("Please login to submit");
            return;
        }

        // Validate the raw code
        const validationError = validateCode(code, language);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setStatusRibbon(null);

            const result = await createSubmission({
                code: code,
                problemId: problem.id,
                userId: session.user.id,
                language,
            });

            console.log("result: ", result);

            if (result.success && result.submission) {
                setStatusRibbon({type: "submitted"});
                console.log("Submission id check:", result.submission.id)
                // todo: push into submissions state
                setSubmissions(prev=>[...prev, result.submission]);
            }
            if (!result.success) {
                setError(result.error || "Submission failed");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Submission failed");
        }
    };

    const languages = Object.entries(SUPPORTED_LANGUAGES).map(
        ([value, data]) => ({
            value: value as SupportedLanguage,
            label: data.name.split(" ")[0],
        })
    );

    return (
        <div className="w-full border rounded-lg shadow-lg overflow-hidden h-full">
            <div
                className="w-full h-[5vh] rounded-t-lg flex items-center justify-between px-4 text-white"
                style={{
                    background:
                        "radial-gradient(circle, #241F2A 80%, #39234E 110%)",
                }}
            >
                <span className="font-medium">Code</span>
                <div className="flex items-center space-x-3 relative">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            onKeyUp={(e) =>
                                e.key === "Enter" &&
                                setDropdownOpen(!dropdownOpen)
                            }
                            onKeyDown={(e) =>
                                e.key === " " && setDropdownOpen(!dropdownOpen)
                            }
                            className="text-xs rounded-md px-2 py-1 flex items-center justify-between text-white focus:outline-none focus:ring-0"
                            style={{
                                background:
                                    "radial-gradient(circle, #241F2A 80%, #39234E 110%)",
                                border: "1px solid white",
                            }}
                        >
                            {languages.find((lang) => lang.value === language)
                                ?.label || "Language"}
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
                                    background:
                                        "radial-gradient(circle, #241F2A 80%, #39234E 110%)",
                                }}
                            >
                                {languages.map((lang) => (
                                    <button
                                        key={lang.value}
                                        onClick={() => {
                                            setLanguage(lang.value);
                                            setDropdownOpen(false);
                                        }}
                                        onKeyUp={(e) =>
                                            e.key === "Enter" &&
                                            setLanguage(lang.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === " " &&
                                            setLanguage(lang.value)
                                        }
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
                        onClick={()=>startTransition(handleSubmit)}
                        disabled={isPending}
                        className="px-3 py-1 rounded-md text-xs font-semibold  text-white bg-primary hover:bg-secondary disabled:opacity-50"
                    >
                        {isPending ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </div>

            {statusRibbon?.type === "error" && (
                <div className="top-[5vh]  p-2 bg-red-100 text-red-700 text-sm">
                    {statusRibbon.message}
                </div>
            )}

            {statusRibbon?.type === "submitted" && (
                <div className="top-[5vh] p-2 bg-green-100 text-green-700 text-sm">
                    Submitted successfully!
                </div>
            )}

            {statusRibbon?.type === "evaluation" && statusRibbon.passed === statusRibbon.total && (
                <div className="top-[5vh] p-2 bg-green-100 text-green-700 text-sm">
                    Submitted successfully!
                </div>
            )}

            {statusRibbon?.type === "evaluation" && statusRibbon.passed !== statusRibbon.total && (
                <div className="top-[5vh] p-2 bg-yellow-300 text-green-700 text-sm">
                    Submitted successfully!
                </div>
            )}



            <Editor
                height="calc(100% - 5vh)"
                theme="vs-dark"
                value={code}
                onChange={(value) => {
                    if (!value) return;
                    setCode(value);
                    const snippets: CodeSnippets = JSON.parse(
                        localStorage.getItem(CODE_STORAGE_KEY) || "{}"
                    );
                    snippets[problem.id] = {
                        ...snippets[problem.id],
                        [language]: value,
                    };
                    localStorage.setItem(
                        CODE_STORAGE_KEY,
                        JSON.stringify(snippets)
                    );
                }}
                language={language}
                className="rounded-b-lg"
            />
        </div>
    );
}
