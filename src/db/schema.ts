import {
  boolean,
  int4,
  cockroachEnum,
  cockroachTable,
  text,
  timestamp,
  uniqueIndex,
  index,
  float,
} from "drizzle-orm/cockroach-core";
export const genderEnum = cockroachEnum("Gender", ["male", "female"]);
export const regionEnum = cockroachEnum("crdb_internal_region", [
  "aws-ap-south-1",
]);
export const difficultyEnum = cockroachEnum("Difficulty", [
  "EASY",
  "MEDIUM",
  "HARD",
]);
export const evalEnum = cockroachEnum("EvalEnum", [
  "IN_QUEUE",
  "PROCESSING",
  "ACCEPTED",
  "WRONG_ANSWER",
  "TIME_LIMIT_EXCEEDED",
  "COMPILATION_ERROR",
  "RUNTIME_ERROR_SIGSEGV",
  "RUNTIME_ERROR_SIGXFSZ",
  "RUNTIME_ERROR_SIGFPE",
  "RUNTIME_ERROR_SIGABRT",
  "RUNTIME_ERROR_NZEC",
  "RUNTIME_ERROR_OTHER",
  "INTERNAL_ERROR",
  "EXEC_FORMAT_ERROR",
]);

export const users = cockroachTable(
  "User",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("emailVerified", {
      withTimezone: true,
      mode: "date",
    }),
    image: text("image"),
    teamId: text("teamId").references(() => teams.id),
    phone: text("phone"),
    gender: genderEnum("gender"),
  },
  (table) => [uniqueIndex("User_email_key").on(table.email)],
);

export const accounts = cockroachTable(
  "Account",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
      .notNull()
      .references(() => users.id),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int4("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    uniqueIndex("Account_provider_providerAccountId_key").on(
      table.provider,
      table.providerAccountId,
    ),
  ],
);

export const sessions = cockroachTable(
  "Session",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sessionToken: text("sessionToken").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  },
  (table) => [uniqueIndex("Session_sessionToken_key").on(table.sessionToken)],
);

export const uniRegs = cockroachTable(
  "UniReg",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull(),
    name: text("name").notNull(),
    regNo: text("regNo").notNull(),
    phone: text("phone").notNull(),
    injected: boolean("injected").notNull().default(false),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("UniReg_email_key").on(table.email)],
);

export const teams = cockroachTable(
  "Team",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    shortCode: text("shortCode").notNull(),
    checkedIn: boolean("checkedIn").notNull().default(false),
    disqualify: boolean("disqualify").notNull().default(false),
    hidden: boolean("hidden").notNull().default(false),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("Team_name_key").on(table.name),
    uniqueIndex("Team_shortCode_key").on(table.shortCode),
  ],
);

export const teamRounds = cockroachTable(
  "TeamRound",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    teamId: text("teamId")
      .notNull()
      .references(() => teams.id),
    roundId: text("roundId")
      .notNull()
      .references(() => rounds.id),
  },
  (table) => [
    uniqueIndex("TeamRound_teamId_roundId_key").on(table.teamId, table.roundId),
  ],
);

export const rounds = cockroachTable(
  "Round",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    number: int4("number").notNull(),
    start: timestamp("start", { withTimezone: true, mode: "date" }).notNull(),
    end: timestamp("end", { withTimezone: true, mode: "date" }).notNull(),
    result: timestamp("result", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [uniqueIndex("Round_number_key").on(table.number)],
);

export const problems = cockroachTable(
  "Problem",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    nickname: text("nickname").notNull(),
    description: text("description").notNull(),
    difficulty: difficultyEnum("difficulty").notNull(),
    initial: int4("initial").notNull(), // Starting points
    minimum: int4("minimum").notNull(), // Minimum points floor
    decay: int4("decay").notNull(), // Number of solves to reach minimum
    // Download links
    web_code: text("web_code").notNull(),
    // Test case counts (always 10 total, but keeping for flexibility)
    normal_cases: int4("normal_cases").notNull(),
    edge_cases: int4("edge_cases").notNull(),
    // Time and memory limits
    timeLimitMs: int4("timeLimitMs").notNull().default(1000),
    memoryLimitKb: int4("memoryLimitKb").notNull().default(262144), // 256MB
    effectiveSolves: int4("effective_solves").notNull().default(0),
    roundId: text("roundId")
      .notNull()
      .references(() => rounds.id),
    isHidden: boolean("isHidden").notNull().default(false),
  },
  (table) => [index("Problem_roundId_idx").on(table.roundId)],
);

export const testcases = cockroachTable(
  "Testcase",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    weight: int4("weight").notNull().default(1),
    input: text("input").notNull(),
    output: text("output").notNull(),
    problemId: text("problemId")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    isEdge: boolean("isEdge").notNull().default(false),
    isHidden: boolean("isHidden").notNull().default(false), // Hidden from users in results
    orderIndex: int4("orderIndex").notNull().default(0),
  },
  (table) => [
    index("Testcase_problemId_idx").on(table.problemId),
    index("Testcase_problemId_orderIndex_idx").on(
      table.problemId,
      table.orderIndex,
    ),
  ],
);

export const submissions = cockroachTable(
  "Submission",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    code: text("code").notNull(),
    language: text("language").notNull(), // Programming language used
    problemId: text("problemId")
      .notNull()
      .references(() => problems.id),
    userId: text("userId")
      .notNull()
      .references(() => users.id),
    teamId: text("teamId").references(() => teams.id), // For team-based scoring
    evaluated: boolean("evaluated").notNull().default(false),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    testcasesPassed: int4("testcasesPassed").notNull().default(0), // 0-10
  },
  (table) => [
    index("Submission_userId_idx").on(table.userId),
    index("Submission_problemId_idx").on(table.problemId),
    index("Submission_teamId_idx").on(table.teamId),
    index("Submission_createdAt_idx").on(table.createdAt),
    index("Submission_problemId_userId_idx").on(table.problemId, table.userId),
  ],
);

// Tracks best solve per user/team per problem for partial scoring
export const solve = cockroachTable(
  "Solve",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    problemId: text("problemId")
      .notNull()
      .references(() => problems.id),
    teamId: text("teamId").references(() => teams.id),
    // Reference to the best submission
    bestSubmissionId: text("bestSubmissionId").references(() => submissions.id),
    // Best testcases passed (0-10)
    testcasesPassed: int4("testcasesPassed").notNull().default(0),
  },
  (table) => [
    uniqueIndex("Solve_teamId_problemId_key").on(table.teamId, table.problemId),
    index("Solve_problemId_idx").on(table.problemId),
    index("Solve_teamId_idx").on(table.teamId),
    index("Solve_problemId_testcasesPassed_idx").on(
      table.problemId,
      table.testcasesPassed,
    ),
  ],
);

// Junction table for detailed per-testcase results per submission
export const submissionTestcases = cockroachTable(
  "SubmissionTestcase",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    submissionId: text("submissionId")
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    testcaseId: text("testcaseId")
      .notNull()
      .references(() => testcases.id, { onDelete: "cascade" }),
    passed: boolean("passed").notNull(),
    token: text("token"),
    evaluated: boolean("evaluated").notNull().default(false),
    evaluationStatus: evalEnum("evaluationStatus"),
    // Quick access to results without joining

    executionTimeMs: float("executionTimeMs"),
    memoryUsedKb: float("memoryUsedKb"),
    // For debugging (only store if needed)
    actualOutput: text("actualOutput"),
    errorMessage: text("errorMessage"),
  },
  (table) => [
    uniqueIndex("SubmissionTestcase_token_key").on(table.token),
    uniqueIndex("SubmissionTestcase_submission_testcase_key").on(
      table.submissionId,
      table.testcaseId,
    ),
    index("SubmissionTestcase_submissionId_idx").on(table.submissionId),
    index("SubmissionTestcase_testcaseId_idx").on(table.testcaseId),
  ],
);

export const admins = cockroachTable(
  "Admin",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("Admin_userId_key").on(table.userId)],
);

export const flags = cockroachTable(
  "Flags",
  {
    name: text("name").primaryKey(),
    value: boolean("value").notNull(),
  },
  (table) => [uniqueIndex("Flags_name_key").on(table.name)],
);

export const news = cockroachTable("News", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  content: text("content").notNull(),
  title: text("title").notNull(),
  time: timestamp("time", { withTimezone: true, mode: "date" }).notNull(),
});

export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Round = typeof rounds.$inferSelect;
export type Problem = typeof problems.$inferSelect;
export type Testcase = typeof testcases.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type Solve = typeof solve.$inferSelect;
export type SubmissionTestcase = typeof submissionTestcases.$inferSelect;
export type TeamRound = typeof teamRounds.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type Flags = typeof flags.$inferSelect;
export type News = typeof news.$inferSelect;
export type UniReg = typeof uniRegs.$inferSelect;
export type Gender = (typeof genderEnum.enumValues)[number];
export type Region = (typeof regionEnum.enumValues)[number];
export type Difficulty = (typeof difficultyEnum.enumValues)[number];
export type EvalEnum = (typeof evalEnum.enumValues)[number];
