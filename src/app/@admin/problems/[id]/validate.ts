'use client'


let buffer = "";
let output = "";

function cin(type: string) {
  if (!buffer) return null;

  switch (type) {
    case "int": {
      let integer = "";
      buffer = buffer.replace(/^\s+/g, "");
      if (buffer[0] === "-") {
        integer += "-";
        buffer = buffer.substring(1);
      }
      while (
        buffer.length > 0 &&
        !Number.isNaN(Number.parseInt(buffer[0], 10)) &&
        buffer[0] !== " " &&
        buffer[0] !== "\n"
      ) {
        integer += buffer[0];
        buffer = buffer.substring(1);
      }
      if (buffer.startsWith("\n")) buffer = buffer.substring(1);
      return Number.parseInt(integer, 10) ?? null;
    }

    case "string": {
      buffer = buffer.replace(/^\s+/g, "");
      let str = "";
      while (
        buffer.length > 0 &&
        buffer[0] !== " " &&
        buffer[0] !== "\n"
      ) {
        str += buffer[0];
        buffer = buffer.substring(1);
      }
      if (buffer.startsWith("\n")) buffer = buffer.substring(1);
      return str;
    }

    case "line": {
      let line = "";
      while (buffer.length > 0 && buffer[0] !== "\n") {
        line += buffer[0];
        buffer = buffer.substring(1);
      }
      if (buffer.startsWith("\n")) buffer = buffer.substring(1);
      return line;
    }

    case "vector": {
      let vector = [];
      let vectorLine = "";
      while (buffer.length > 0 && buffer[0] !== "\n") {
        vectorLine += buffer[0];
        buffer = buffer.substring(1);
      }
      if (buffer.startsWith("\n")) buffer = buffer.substring(1);
      vector = vectorLine.trim().split(/\s+/).map(n => Number.parseInt(n, 10));
      return vector;
    }

    default:
      throw new Error(`Unsupported type: ${type}`);
  }
}

// Fix any type:
function cout(...args: (string | number)[]) {
  output += args.join(" ");
}

export default function validateIO() {
  return {
    validate: (code: string, stdin: string, expectedOutput: string): boolean => {
      try {
        // Reset globals
        buffer = stdin;
        output = "";

        // Create isolated context
        const scopedCode = `
          return (function(cin, cout, console) {
            "use strict";
            ${code}
          });
        `;

        // Create function with isolated scope
        const timeoutMs = 5000; // 5 second timeout
        const createSandbox = new Function(scopedCode);
        const sandbox = createSandbox();

        // Run with timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Execution timed out')), timeoutMs);
        });

        Promise.race([
          new Promise((resolve) => {
            sandbox(cin, cout, { log: cout });
            resolve(true);
          }),
          timeoutPromise
        ]);

        // Normalize outputs
        const normalizedOutput = output.trim().replace(/\r\n/g, '\n');
        const normalizedExpected = expectedOutput.trim().replace(/\r\n/g, '\n');

        return normalizedOutput === normalizedExpected;

      } catch (error) {
        console.error('Validation error:', error);
        return false;
      }
    }
  };
}

export function validateCode(code: string, input: string, expectedOutput: string): boolean {
  const validator = validateIO();
  return validator.validate(code, input, expectedOutput);
}