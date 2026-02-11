"use client";

import { useEffect, useState, useTransition } from "react";
import Editor from "@monaco-editor/react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import createSubmission from "@/app/actions/create-submission";
import type { EvalEnum } from "@/db/schema";
import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@/utils/judge0-langs";
import { formula1Bold } from "@/lib/fonts";
import { Poppins } from "next/font/google";

const poppins = Poppins({ weight: ["400", "500", "600"], subsets: ["latin"] });

const LANGUAGE_STORAGE_KEY = "preferred-language" as const;
const CODE_STORAGE_KEY = "code-snippets" as const;

type SubmissionWithUser = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  evaluated: boolean;
  evaluationStatus: EvalEnum | null;
  testcasesPassed: number;
  totalTestcases: number;
  user: { name: string | null };
};

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

export type StatusRibbonProps =
  | SubmittedStatusRibbonProps
  | EvaluationStatusRibbonProps
  | ErrorStatusRibbonProps
  | null;

interface CodeSnippets {
  [key: string]: {
    [language: string]: string;
  };
}

const validateCode = (
  code: string,
  language: SupportedLanguage,
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

export default function CodeEditor({
  problem,
  session,
  setStatusRibbon,
  statusRibbon,
  setSubmissions,
}: CodeEditorProps) {
  const [language, setLanguage] = useState<SupportedLanguage>("c");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem(
        LANGUAGE_STORAGE_KEY,
      ) as SupportedLanguage;
      if (storedLanguage) {
        setLanguage(storedLanguage);
      }
    }
  }, []);

  const [code, setCode] = useState<string>(() => {
    if (typeof window === "undefined")
      return SUPPORTED_LANGUAGES[language].defaultCode;
    const snippets: CodeSnippets = JSON.parse(
      localStorage.getItem(CODE_STORAGE_KEY) || "{}",
    );
    return (
      snippets[problem.id]?.[language] ||
      SUPPORTED_LANGUAGES[language].defaultCode
    );
  });

  const [isPending, startTransition] = useTransition();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const setError = (message: string) => {
    setStatusRibbon({ type: "error", message });
  };
  useEffect(() => {
    const snippets: CodeSnippets = JSON.parse(
      localStorage.getItem(CODE_STORAGE_KEY) || "{}",
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

      // console.log("result: ", result);

      if (result.success && result.submission) {
        setStatusRibbon({ type: "submitted" });
        // console.log("Submission id check:", result.submission.id)
        // todo: push into submissions state
        setSubmissions((prev) => [
          ...prev,
          {
            ...result.submission,
            evaluationStatus: null,
          },
        ]);
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
    }),
  );

  return (
    <div className="w-full h-full border-2 border-[#A7282D] rounded-lg shadow-lg overflow-hidden flex flex-col relative">
      <div className="w-full min-h-[5vh] bg-[#A7282D] flex items-center justify-between px-4 text-white shrink-0">
        <span className={`font-medium text-sm md:text-base ${formula1Bold.className}`}>Code</span>
        <div className="flex items-center space-x-3 relative">
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-xs rounded-md px-4 md:px-8 border-black bg-[#FF9397] py-1 flex items-center justify-center text-black whitespace-nowrap"
            >
              {languages.find((lang) => lang.value === language)?.label ||
                "Language"}
              {dropdownOpen ? (
                <FiChevronUp className="ml-2" />
              ) : (
                <FiChevronDown className="ml-2" />
              )}
            </button>
            {dropdownOpen && (
              <ul className="absolute top-full right-0 mt-1 w-40 bg-black rounded-md shadow-lg z-60">
                {languages.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => {
                      setLanguage(lang.value);
                      setDropdownOpen(false);
                    }}
                    className="px-2 py-2 text-white cursor-pointer hover:bg-gray-700 w-full text-left text-sm"
                    type="button"
                  >
                    {lang.label}
                  </button>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Status ribbons */}
      {statusRibbon?.type === "error" && (
        <div className={`p-2 bg-red-100 text-red-700 text-xs md:text-sm shrink-0 ${poppins.className}`}>
          {statusRibbon.message}
        </div>
      )}

      {statusRibbon?.type === "submitted" && (
        <div className={`p-2 bg-green-100 text-green-700 text-xs md:text-sm shrink-0 ${poppins.className}`}>
          Submitted successfully!
        </div>
      )}

      {statusRibbon?.type === "evaluation" &&
        statusRibbon.passed === statusRibbon.total && (
          <div className={`p-2 bg-green-100 text-green-700 text-xs md:text-sm shrink-0 ${poppins.className}`}>
            All testcases passed!
          </div>
        )}

      {statusRibbon?.type === "evaluation" &&
        statusRibbon.passed !== statusRibbon.total && (
          <div className={`p-2 bg-yellow-300 text-green-700 text-xs md:text-sm shrink-0 ${poppins.className}`}>
            {statusRibbon.passed}/{statusRibbon.total} testcases passed
          </div>
        )}

      <div className="flex-1 w-full min-h-0 overflow-hidden">
        <Editor
          height="100%"
          theme="hc-black"
          value={code}
          onChange={(value) => {
            if (!value) return;
            setCode(value);
            const snippets: CodeSnippets = JSON.parse(
              localStorage.getItem(CODE_STORAGE_KEY) || "{}",
            );
            snippets[problem.id] = {
              ...snippets[problem.id],
              [language]: value,
            };
            localStorage.setItem(CODE_STORAGE_KEY, JSON.stringify(snippets));
          }}
          options={{
            renderLineHighlight: "none",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
          language={language}
        />
      </div>

      <button
        type="button"
        onClick={() => startTransition(() => void handleSubmit())}
        disabled={isPending}
        className="absolute bottom-2 right-2 md:bottom-4 md:right-4 px-4 md:px-7 border py-1.5 md:py-2 rounded-md text-xs md:text-sm font-semibold text-white bg-black hover:bg-secondary disabled:opacity-50 z-50 shadow-lg"
      >
        {isPending ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}
