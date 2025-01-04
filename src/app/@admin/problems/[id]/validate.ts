import vm from "vm";

let buffer = "";
let output = "";

function cin(type: string) {
  if (!buffer) return null;

  switch (type) {
    case "int":
      let integer = "";
      buffer = buffer.replace(/^\s+/g, "");
      if (buffer[0] === "-") {
        integer += "-";
        buffer = buffer.substring(1);
      }
      while (
        buffer.length > 0 &&
        !isNaN(parseInt(buffer[0], 10)) &&
        buffer[0] !== " " &&
        buffer[0] !== "\n"
      ) {
        integer += buffer[0];
        buffer = buffer.substring(1);
      }
      if (buffer.startsWith("\n")) buffer = buffer.substring(1);
      return parseInt(integer, 10) ?? null;

    case "string":
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

    case "line":
      let line = "";
      while (buffer.length > 0 && buffer[0] !== "\n") {
        line += buffer[0];
        buffer = buffer.substring(1);
      }
      if (buffer.startsWith("\n")) buffer = buffer.substring(1);
      return line;

    case "vector":
      let vector = [];
      let vectorLine = "";
      while (buffer.length > 0 && buffer[0] !== "\n") {
        vectorLine += buffer[0];
        buffer = buffer.substring(1);
      }
      if (buffer.startsWith("\n")) buffer = buffer.substring(1);
      vector = vectorLine.trim().split(/\s+/).map(n => parseInt(n, 10));
      return vector;

    default:
      throw new Error(`Unsupported type: ${type}`);
  }
}

function cout(...args: any[]) {
  output += args.join(" ");
}

export default function validateIO() {
  return {
    validate: function(code: string, stdin: string, expectedOutput: string): boolean {
      try {
        // Reset globals
        buffer = stdin;
        output = "";

        // Create sandbox context
        const context = {
          cin,
          cout,
          console: { log: cout }
        };

        // Run code in VM
        const sandbox = vm.createContext(context);
        vm.runInContext(code, sandbox);

        // Normalize outputs (trim whitespace, normalize line endings)
        const normalizedOutput = output.trim().replace(/\r\n/g, '\n');
        const normalizedExpected = expectedOutput.trim().replace(/\r\n/g, '\n');

        // Compare outputs
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
  console.log('Validating code:', code);
  console.log('Input:', input);
  console.log('Expected output:', expectedOutput);
  return validator.validate(code, input, expectedOutput);
}