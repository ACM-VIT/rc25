import { db } from "@/db";
import { testcases, type Testcase } from "@/db/schema";
import type { SQL } from "drizzle-orm";

type QueryFactory<T> = () => Promise<T>;

let dynamicColumnsAvailable: boolean | null = null;

const isMissingDynamicColumnError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string; detail?: string };
  if (String(err.code ?? "") !== "42703") return false;
  const message = String(err.message ?? err.detail ?? "");
  return (
    message.includes("\"dynamicMin\"") ||
    message.includes("\"dynamicDecay\"") ||
    message.includes("dynamicMin") ||
    message.includes("dynamicDecay")
  );
};

export const withDynamicTestcaseColumns = async <T>(
  withDynamic: QueryFactory<T>,
  withoutDynamic: QueryFactory<T>
): Promise<T> => {
  if (dynamicColumnsAvailable === false) {
    return withoutDynamic();
  }

  try {
    const result = await withDynamic();
    dynamicColumnsAvailable = true;
    return result;
  } catch (error) {
    if (!isMissingDynamicColumnError(error)) {
      throw error;
    }
    dynamicColumnsAvailable = false;
    return withoutDynamic();
  }
};

const baseTestcaseSelect = {
  id: testcases.id,
  weight: testcases.weight,
  input: testcases.input,
  output: testcases.output,
  problemId: testcases.problemId,
  isEdge: testcases.isEdge,
};

const dynamicTestcaseSelect = {
  ...baseTestcaseSelect,
  dynamicMin: testcases.dynamicMin,
  dynamicDecay: testcases.dynamicDecay,
};

export const selectTestcasesSafe = async (where?: SQL): Promise<Testcase[]> =>
  withDynamicTestcaseColumns(
    async () => {
      const baseQuery = db.select(dynamicTestcaseSelect).from(testcases);
      const finalQuery = where ? baseQuery.where(where) : baseQuery;
      return await finalQuery;
    },
    async () => {
      const baseQuery = db.select(baseTestcaseSelect).from(testcases);
      const finalQuery = where ? baseQuery.where(where) : baseQuery;
      const rows = await finalQuery;
      return rows.map((row) => ({
        ...row,
        dynamicMin: null,
        dynamicDecay: null,
      }));
    }
  );
