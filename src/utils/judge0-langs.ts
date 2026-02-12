export const SUPPORTED_LANGUAGES = {
  c: {
    id: 48,
    name: "C (GCC 7.4.0)",
    defaultCode: `int solve() {
    // Write your code here
    return 0;
}`,
  },
  cpp: {
    id: 52,
    name: "C++ (GCC 7.4.0)",
    defaultCode: `void solve() {
    // Write your code here
}`,
  },
  java: {
    id: 62,
    name: "Java (OpenJDK 13.0.1)",
    defaultCode: `class Solution {
    public void solve() {
        // Write your code here
    }
}`,
  },
  javascript: {
    id: 63,
    name: "JavaScript (Node.js 12.14.0)",
    defaultCode: `function solve() {
    // Write your code here
}`,
  },
  python: {
    id: 71,
    name: "Python (3.8.1)",
    defaultCode: `def solve():
    # Write your code here
    pass`,
  },
  go: {
    id: 60,
    name: "Go (1.13.5)",
    defaultCode: `func solve() {
    // Write your code here
}`,
  },
  rust: {
    id: 73,
    name: "Rust (1.40.0)",
    defaultCode: `fn solve() {
    // Write your code here
}`,
  },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;
export type SupportedLanguageConfig =
  (typeof SUPPORTED_LANGUAGES)[SupportedLanguage];
export type SupportedLanguageId = SupportedLanguageConfig["id"];
export type SupportedLanguageName = SupportedLanguageConfig["name"];
