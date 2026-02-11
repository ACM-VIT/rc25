import { EvalEnum } from "@/db/schema";

export const Judge0StatusEnum = {
  InQueue: "In Queue",
  Processing: "Processing",
  Accepted: "Accepted",
  WrongAnswer: "Wrong Answer",
  TimeLimitExceeded: "Time Limit Exceeded",
  CompilationError: "Compilation Error",
  RuntimeErrorSIGSEGV: "Runtime Error (SIGSEGV)",
  RuntimeErrorSIGXFSZ: "Runtime Error (SIGXFSZ)",
  RuntimeErrorSIGFPE: "Runtime Error (SIGFPE)",
  RuntimeErrorSIGABRT: "Runtime Error (SIGABRT)",
  RuntimeErrorNZEC: "Runtime Error (NZEC)",
  RuntimeErrorOther: "Runtime Error (Other)",
  InternalError: "Internal Error",
  ExecFormatError: "Exec Format Error",
} as const;

export type Judge0StatusEnumValue =
  (typeof Judge0StatusEnum)[keyof typeof Judge0StatusEnum];

export function judge0StatusToEval(status: Judge0StatusEnumValue): EvalEnum {
  switch (status) {
    case Judge0StatusEnum.InQueue:
      return "IN_QUEUE";
    case Judge0StatusEnum.Processing:
      return "PROCESSING";
    case Judge0StatusEnum.Accepted:
      return "ACCEPTED";
    case Judge0StatusEnum.WrongAnswer:
      return "WRONG_ANSWER";
    case Judge0StatusEnum.TimeLimitExceeded:
      return "TIME_LIMIT_EXCEEDED";
    case Judge0StatusEnum.CompilationError:
      return "COMPILATION_ERROR";
    case Judge0StatusEnum.RuntimeErrorSIGSEGV:
      return "RUNTIME_ERROR_SIGSEGV";
    case Judge0StatusEnum.RuntimeErrorSIGXFSZ:
      return "RUNTIME_ERROR_SIGXFSZ";
    case Judge0StatusEnum.RuntimeErrorSIGFPE:
      return "RUNTIME_ERROR_SIGFPE";
    case Judge0StatusEnum.RuntimeErrorSIGABRT:
      return "RUNTIME_ERROR_SIGABRT";
    case Judge0StatusEnum.RuntimeErrorNZEC:
      return "RUNTIME_ERROR_NZEC";
    case Judge0StatusEnum.RuntimeErrorOther:
      return "RUNTIME_ERROR_OTHER";
    case Judge0StatusEnum.InternalError:
      return "INTERNAL_ERROR";
    case Judge0StatusEnum.ExecFormatError:
      return "EXEC_FORMAT_ERROR";
    default: {
      const _exhaustiveCheck: never = status;
      return "INTERNAL_ERROR";
    }
  }
}
