CREATE TYPE "Difficulty" AS ENUM('EASY', 'MEDIUM', 'HARD');--> statement-breakpoint
CREATE TYPE "EvalEnum" AS ENUM('IN_QUEUE', 'PROCESSING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'COMPILATION_ERROR', 'RUNTIME_ERROR_SIGSEGV', 'RUNTIME_ERROR_SIGXFSZ', 'RUNTIME_ERROR_SIGFPE', 'RUNTIME_ERROR_SIGABRT', 'RUNTIME_ERROR_NZEC', 'RUNTIME_ERROR_OTHER', 'INTERNAL_ERROR', 'EXEC_FORMAT_ERROR');--> statement-breakpoint
CREATE TYPE "Gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TABLE "Account" (
	"id" string PRIMARY KEY,
	"userId" string NOT NULL,
	"type" string NOT NULL,
	"provider" string NOT NULL,
	"providerAccountId" string NOT NULL,
	"refresh_token" string,
	"access_token" string,
	"expires_at" int4,
	"token_type" string,
	"scope" string,
	"id_token" string,
	"session_state" string,
	CONSTRAINT "Account_provider_providerAccountId_key" UNIQUE("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "Admin" (
	"id" string PRIMARY KEY,
	"userId" string NOT NULL,
	"createdAt" timestamptz DEFAULT now() NOT NULL,
	"updatedAt" timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT "Admin_userId_key" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "Flags" (
	"name" string PRIMARY KEY,
	"value" bool NOT NULL,
	CONSTRAINT "Flags_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "News" (
	"id" string PRIMARY KEY,
	"content" string NOT NULL,
	"title" string NOT NULL,
	"time" timestamptz NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Problem" (
	"id" string PRIMARY KEY,
	"title" string NOT NULL,
	"nickname" string NOT NULL,
	"description" string NOT NULL,
	"difficulty" "Difficulty" NOT NULL,
	"initial" int4 NOT NULL,
	"minimum" int4 NOT NULL,
	"decay" int4 NOT NULL,
	"web_code" string NOT NULL,
	"normal_cases" int4 NOT NULL,
	"edge_cases" int4 NOT NULL,
	"timeLimitMs" int4 DEFAULT 1000 NOT NULL,
	"memoryLimitKb" int4 DEFAULT 262144 NOT NULL,
	"roundId" string NOT NULL,
	"isHidden" bool DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Round" (
	"id" string PRIMARY KEY,
	"number" int4 NOT NULL,
	"start" timestamptz NOT NULL,
	"end" timestamptz NOT NULL,
	"result" timestamptz NOT NULL,
	CONSTRAINT "Round_number_key" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "Session" (
	"id" string PRIMARY KEY,
	"sessionToken" string NOT NULL,
	"userId" string NOT NULL,
	"expires" timestamptz NOT NULL,
	CONSTRAINT "Session_sessionToken_key" UNIQUE("sessionToken")
);
--> statement-breakpoint
CREATE TABLE "Solve" (
	"id" string PRIMARY KEY,
	"problemId" string NOT NULL,
	"userId" string NOT NULL,
	"teamId" string,
	"bestSubmissionId" string,
	"testcasesPassed" int4 DEFAULT 0 NOT NULL,
	CONSTRAINT "Solve_userId_problemId_key" UNIQUE("userId","problemId"),
	CONSTRAINT "Solve_teamId_problemId_key" UNIQUE("teamId","problemId")
);
--> statement-breakpoint
CREATE TABLE "SubmissionTestcase" (
	"id" string PRIMARY KEY,
	"submissionId" string NOT NULL,
	"testcaseId" string NOT NULL,
	"passed" bool NOT NULL,
	"executionTimeMs" int4,
	"memoryUsedKb" int4,
	"actualOutput" string,
	"errorMessage" string,
	CONSTRAINT "SubmissionTestcase_submission_testcase_key" UNIQUE("submissionId","testcaseId")
);
--> statement-breakpoint
CREATE TABLE "Submission" (
	"id" string PRIMARY KEY,
	"code" string NOT NULL,
	"language" string NOT NULL,
	"problemId" string NOT NULL,
	"userId" string NOT NULL,
	"teamId" string,
	"token" string,
	"createdAt" timestamptz DEFAULT now() NOT NULL,
	"updatedAt" timestamptz DEFAULT now() NOT NULL,
	"evaluated" bool DEFAULT false NOT NULL,
	"evaluationStatus" "EvalEnum",
	"testcasesPassed" int4 DEFAULT 0 NOT NULL,
	CONSTRAINT "Submission_token_key" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "TeamRound" (
	"id" string PRIMARY KEY,
	"teamId" string NOT NULL,
	"roundId" string NOT NULL,
	CONSTRAINT "TeamRound_teamId_roundId_key" UNIQUE("teamId","roundId")
);
--> statement-breakpoint
CREATE TABLE "Team" (
	"id" string PRIMARY KEY,
	"name" string NOT NULL,
	"shortCode" string NOT NULL,
	"checkedIn" bool DEFAULT false NOT NULL,
	"disqualify" bool DEFAULT false NOT NULL,
	"hidden" bool DEFAULT false NOT NULL,
	"createdAt" timestamptz DEFAULT now() NOT NULL,
	"updatedAt" timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT "Team_name_key" UNIQUE("name"),
	CONSTRAINT "Team_shortCode_key" UNIQUE("shortCode")
);
--> statement-breakpoint
CREATE TABLE "Testcase" (
	"id" string PRIMARY KEY,
	"weight" int4 DEFAULT 1 NOT NULL,
	"input" string NOT NULL,
	"output" string NOT NULL,
	"problemId" string NOT NULL,
	"isEdge" bool DEFAULT false NOT NULL,
	"isHidden" bool DEFAULT false NOT NULL,
	"orderIndex" int4 DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "UniReg" (
	"id" string PRIMARY KEY,
	"email" string NOT NULL,
	"name" string NOT NULL,
	"regNo" string NOT NULL,
	"phone" string NOT NULL,
	"injected" bool DEFAULT false NOT NULL,
	"createdAt" timestamptz DEFAULT now() NOT NULL,
	"updatedAt" timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT "UniReg_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" string PRIMARY KEY,
	"name" string,
	"email" string NOT NULL,
	"emailVerified" timestamptz,
	"image" string,
	"teamId" string,
	"phone" string,
	"gender" "Gender",
	CONSTRAINT "User_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_User_id_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id");--> statement-breakpoint
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_User_id_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id");--> statement-breakpoint
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_roundId_Round_id_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id");--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_User_id_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id");--> statement-breakpoint
ALTER TABLE "Solve" ADD CONSTRAINT "Solve_problemId_Problem_id_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id");--> statement-breakpoint
ALTER TABLE "Solve" ADD CONSTRAINT "Solve_userId_User_id_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id");--> statement-breakpoint
ALTER TABLE "Solve" ADD CONSTRAINT "Solve_teamId_Team_id_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id");--> statement-breakpoint
ALTER TABLE "Solve" ADD CONSTRAINT "Solve_bestSubmissionId_Submission_id_fkey" FOREIGN KEY ("bestSubmissionId") REFERENCES "Submission"("id");--> statement-breakpoint
ALTER TABLE "SubmissionTestcase" ADD CONSTRAINT "SubmissionTestcase_submissionId_Submission_id_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "SubmissionTestcase" ADD CONSTRAINT "SubmissionTestcase_testcaseId_Testcase_id_fkey" FOREIGN KEY ("testcaseId") REFERENCES "Testcase"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_problemId_Problem_id_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id");--> statement-breakpoint
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_User_id_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id");--> statement-breakpoint
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_teamId_Team_id_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id");--> statement-breakpoint
ALTER TABLE "TeamRound" ADD CONSTRAINT "TeamRound_teamId_Team_id_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id");--> statement-breakpoint
ALTER TABLE "TeamRound" ADD CONSTRAINT "TeamRound_roundId_Round_id_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id");--> statement-breakpoint
ALTER TABLE "Testcase" ADD CONSTRAINT "Testcase_problemId_Problem_id_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_Team_id_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id");--> statement-breakpoint
CREATE INDEX "Problem_roundId_idx" ON "Problem" ("roundId");--> statement-breakpoint
CREATE INDEX "Solve_problemId_idx" ON "Solve" ("problemId");--> statement-breakpoint
CREATE INDEX "Solve_teamId_idx" ON "Solve" ("teamId");--> statement-breakpoint
CREATE INDEX "Solve_problemId_testcasesPassed_idx" ON "Solve" ("problemId","testcasesPassed");--> statement-breakpoint
CREATE INDEX "SubmissionTestcase_submissionId_idx" ON "SubmissionTestcase" ("submissionId");--> statement-breakpoint
CREATE INDEX "SubmissionTestcase_testcaseId_idx" ON "SubmissionTestcase" ("testcaseId");--> statement-breakpoint
CREATE INDEX "Submission_userId_idx" ON "Submission" ("userId");--> statement-breakpoint
CREATE INDEX "Submission_problemId_idx" ON "Submission" ("problemId");--> statement-breakpoint
CREATE INDEX "Submission_teamId_idx" ON "Submission" ("teamId");--> statement-breakpoint
CREATE INDEX "Submission_createdAt_idx" ON "Submission" ("createdAt");--> statement-breakpoint
CREATE INDEX "Submission_problemId_userId_idx" ON "Submission" ("problemId","userId");--> statement-breakpoint
CREATE INDEX "Testcase_problemId_idx" ON "Testcase" ("problemId");--> statement-breakpoint
CREATE INDEX "Testcase_problemId_orderIndex_idx" ON "Testcase" ("problemId","orderIndex");
