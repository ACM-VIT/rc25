export const SUPPORTED_LANGUAGES = {
  'c': { 
    id: 103, 
    name: "C (GCC 14.1.0)",
    defaultCode: `int solve() {
    // Write your code here
    return 0;
}`
  },
  'cpp': { 
    id: 52, 
    name: "C++ (GCC 7.4.0)",
    defaultCode: `void solve() {
    // Write your code here
}`
  },
  'java': { 
    id: 96, 
    name: "JavaFX (JDK 17.0.6, OpenJFX 22.0.2)",
    defaultCode: `class Solution {
    public void solve() {
        // Write your code here
    }
}`
  },
  'javascript': { 
    id: 102, 
    name: "JavaScript (Node.js 22.08.0)",
    defaultCode: `function solve() {
    // Write your code here
}`
  },
  'python': { 
    id: 100, 
    name: "Python (3.12.5)",
    defaultCode: `def solve():
    # Write your code here
    pass`
  },
  'go': { 
    id: 95, 
    name: "Go (1.18.5)",
    defaultCode: `func solve() {
    // Write your code here
}`
  },
  'rust': {
    id: 73,
    name: "Rust (1.40.0)",
    defaultCode: `fn solve() {
    // Write your code here
}`
  }
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;
export type SupportedLanguageConfig =
  (typeof SUPPORTED_LANGUAGES)[SupportedLanguage];
export type SupportedLanguageId = SupportedLanguageConfig["id"];
export type SupportedLanguageName = SupportedLanguageConfig["name"];
