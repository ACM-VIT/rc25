import vm from "node:vm";

let buffer = "";
let output = "";

function cin(type: string) {
  if (!buffer) return null;

  switch (type) {
    case "int": {
      buffer = buffer.replace(/^\s+/g, "");
      let integer = buffer[0] === "-" ? "-" : "";
      if (integer === "-") buffer = buffer.substring(1);
      
      while (buffer.length > 0 && !Number.isNaN(Number.parseInt(buffer[0])) && buffer[0] !== " " && buffer[0] !== "\n") {
        integer += buffer[0];
        buffer = buffer.substring(1);
      }
      if (buffer.startsWith("\n")) buffer = buffer.substring(1);
      return Number.parseInt(integer) || null;
    }

    case "string": {
      buffer = buffer.replace(/^\s+/g, "");
      let str = "";
      while (buffer.length > 0 && buffer[0] !== " " && buffer[0] !== "\n") {
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
    case "float": {
      // Extract the float/double using modified logic
      let floatStr = "";
      buffer = buffer.trimStart();
      // Check for negative sign
      if (buffer[0] === "-") {
        floatStr += "-";
        buffer = buffer.substring(1);
      }
      while (
        buffer.length > 0 &&
        (buffer[0] === "." || !Number.isNaN(Number.parseInt(buffer[0], 10))) &&
        buffer[0] !== " "
      ) {
        floatStr += buffer[0];
        buffer = buffer.substring(1);
      }
      if (buffer.startsWith("\n")) {
        buffer = buffer.substring(1);
      }
      // Parse the float string to a number. Return null if no digits were found.
      return Number.parseFloat(floatStr) ?? null;
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

function cout(...args: unknown[]) {
  output += args.join(" ");
}

export function executeCode(code: string, input: string) {
  buffer = input;
  output = "";

  const context = { cin, cout };
  const vmContext = vm.createContext(context);
  
  try {
    vm.runInContext(code, vmContext, { timeout: 5000 });
    return { success: true, output };
  } catch (error) {
    return { 
      success: false, 
      output: error instanceof Error ? error.message : 'Execution error'
    };
  }
}