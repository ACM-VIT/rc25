import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const genderEnum = pgEnum("Gender", ["male", "female"]);
export const difficultyEnum = pgEnum("Difficulty", ["EASY", "MEDIUM", "HARD"]);
export const evalEnum = pgEnum("EvalEnum", ["ACCEPTED", "RUNTIME_ERROR", "COMPILE_ERROR"]);
export const crdbInternalRegionEnum = pgEnum("crdb_internal_region", ["aws-ap-south-1"]);

const boolArrayDefault = sql`ARRAY[]::BOOL[]`;

export const users = pgTable(
  "User",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("emailVerified", { withTimezone: true, mode: "date" }),
    image: text("image"),
    teamId: text("teamId"),
    phone: text("phone"),
    gender: genderEnum("gender"),
  },
  (table) => ({
    emailIdx: uniqueIndex("User_email_key").on(table.email),
  })
);

export const accounts = pgTable(
  "Account",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull(),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => ({
    providerIdx: uniqueIndex("Account_provider_providerAccountId_key").on(
      table.provider,
      table.providerAccountId
    ),
  })
);

export const sessions = pgTable(
  "Session",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    sessionToken: text("sessionToken").notNull(),
    userId: text("userId").notNull(),
    expires: timestamp("expires", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => ({
    sessionTokenIdx: uniqueIndex("Session_sessionToken_key").on(table.sessionToken),
  })
);

export const uniRegs = pgTable(
  "UniReg",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull(),
    name: text("name").notNull(),
    regNo: text("regNo").notNull(),
    phone: text("phone").notNull(),
    injected: boolean("injected").notNull().default(false),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("UniReg_email_key").on(table.email),
  })
);

export const teams = pgTable(
  "Team",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    shortCode: text("shortCode").notNull(),
    checkedIn: boolean("checkedIn").notNull().default(false),
    score: integer("score").notNull().default(0),
    disqualify: boolean("disqualify").notNull().default(false),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: uniqueIndex("Team_name_key").on(table.name),
    shortCodeIdx: uniqueIndex("Team_shortCode_key").on(table.shortCode),
  })
);

export const teamRounds = pgTable(
  "TeamRound",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    teamId: text("teamId").notNull(),
    roundId: text("roundId").notNull(),
  },
  (table) => ({
    teamRoundIdx: uniqueIndex("TeamRound_teamId_roundId_key").on(table.teamId, table.roundId),
  })
);

export const rounds = pgTable(
  "Round",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    number: integer("number").notNull(),
    start: timestamp("start", { withTimezone: true, mode: "date" }).notNull(),
    end: timestamp("end", { withTimezone: true, mode: "date" }).notNull(),
    result: timestamp("result", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => ({
    numberIdx: uniqueIndex("Round_number_key").on(table.number),
  })
);

export const problems = pgTable("Problem", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  nickname: text("nickname").notNull(),
  description: text("description").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),
  maxScore: integer("maxScore").notNull(),
  lin_dl: text("lin_dl").notNull(),
  win_dl: text("win_dl").notNull(),
  mac_dl: text("mac_dl").notNull(),
  web_code: text("web_code").notNull(),
  normal_cases: integer("normal_cases").notNull(),
  edge_cases: integer("edge_cases").notNull(),
  roundId: text("roundId").notNull(),
  isHidden: boolean("isHidden").notNull().default(false),
});

export const testcases = pgTable("Testcase", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  weight: integer("weight").notNull().default(1),
  dynamicMin: integer("dynamicMin"),
  dynamicDecay: integer("dynamicDecay"),
  input: text("input").notNull(),
  output: text("output").notNull(),
  problemId: text("problemId").notNull(),
  isEdge: boolean("isEdge").notNull().default(false),
});

export const submissions = pgTable(
  "Submission",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    code: text("code").notNull(),
    problemId: text("problemId").notNull(),
    userId: text("userId").notNull(),
    token: text("token"),
    // nullable in Prisma with default 0
    score: integer("score").default(0),
    testcasespassed: boolean("testcasespassed").array().notNull().default(boolArrayDefault),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    evaluated: boolean("evaluated").notNull().default(false),
    evaluationStatus: evalEnum("evaluationStatus"),
  },
  (table) => ({
    tokenIdx: uniqueIndex("Submission_token_key").on(table.token),
  })
);

export const testcaseSubmissions = pgTable(
  "TestcaseSubmission",
  {
    testcaseId: text("testcaseId").notNull(),
    submissionId: text("submissionId").notNull(),
    sequence: integer("sequence").notNull().default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.testcaseId, table.submissionId] }),
    uniqueIdx: uniqueIndex("TestcaseSubmission_testcaseId_submissionId_key").on(
      table.testcaseId,
      table.submissionId
    ),
  })
);

export const admins = pgTable(
  "Admin",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: uniqueIndex("Admin_userId_key").on(table.userId),
  })
);

export const flags = pgTable(
  "Flags",
  {
    name: text("name").primaryKey(),
    value: boolean("value").notNull(),
  },
  (table) => ({
    nameIdx: uniqueIndex("Flags_name_key").on(table.name),
  })
);

export const news = pgTable("News", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  content: text("content").notNull(),
  title: text("title").notNull(),
  time: timestamp("time", { withTimezone: true, mode: "date" }).notNull(),
});

export const teamTestcaseSolves = pgTable(
  "TeamTestcaseSolve",
  {
    teamId: text("teamId").notNull(),
    testcaseId: text("testcaseId").notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.teamId, table.testcaseId] }),
    testcaseIdx: index("TeamTestcaseSolve_testcaseId_idx").on(table.testcaseId),
  })
);

export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Round = typeof rounds.$inferSelect;
export type Problem = typeof problems.$inferSelect;
export type Testcase = typeof testcases.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type TestcaseSubmission = typeof testcaseSubmissions.$inferSelect;
export type TeamRound = typeof teamRounds.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type Flags = typeof flags.$inferSelect;
export type News = typeof news.$inferSelect;
export type UniReg = typeof uniRegs.$inferSelect;
export type Gender = typeof genderEnum.enumValues[number];
export type Difficulty = typeof difficultyEnum.enumValues[number];
export type EvalEnum = typeof evalEnum.enumValues[number];
