export const SUPPORTED_LANGUAGES = {
  'c': { id: 103, name: "C (GCC 14.1.0)" },
  'cpp': { id: 52, name: "C++ (GCC 7.4.0)" },
  'java': { id: 96, name: "JavaFX (JDK 17.0.6, OpenJFX 22.0.2)" },
  'javascript': { id: 102, name: "JavaScript (Node.js 22.08.0)" },
  'python': { id: 100, name: "Python (3.12.5)" },
  'go': { id: 95, name: "Go (1.18.5)" }
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;