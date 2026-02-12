"use server";

import {revalidatePath} from "next/cache";
import { db } from "@/db";
import { uniRegs, users } from "@/db/schema";
import { eq, like } from "drizzle-orm";

type OverrideResult =
  | {
      success: true;
      status: "OVERRIDDEN";
      message: string;
      email: string;
    }
  | {
      success: false;
      status:
        | "USER_NOT_FOUND"
        | "MISSING_EMAIL"
        | "ALREADY_WHITELISTED"
        | "UNKNOWN_ERROR";
      message: string;
      email?: string;
    };

export default async function Override(
  regNo: string,
  teamId: string,
): Promise<OverrideResult> {
  try {
    const userRows = await db
      .select()
      .from(users)
      .where(like(users.name, `%${regNo}`))
      .limit(1);
    const user = userRows[0];

    if (!user) {
      return {
        success: false,
        status: "USER_NOT_FOUND",
        message: `No participant found for reg no ${regNo}.`,
      };
    }

    const email = user.email?.trim().toLowerCase() ?? "";
    if (!email) {
      return {
        success: false,
        status: "MISSING_EMAIL",
        message: "Participant does not have an email on record.",
      };
    }

    const existing = await db
      .select({ id: uniRegs.id, regNo: uniRegs.regNo })
      .from(uniRegs)
      .where(eq(uniRegs.email, email))
      .limit(1);

    if (existing[0]) {
      return {
        success: false,
        status: "ALREADY_WHITELISTED",
        message: `${email} is already whitelisted${
          existing[0].regNo ? ` (reg no ${existing[0].regNo})` : ""
        }.`,
        email,
      };
    }

    const inserted = await db
      .insert(uniRegs)
      .values({
        regNo,
        name: user.name?.slice(0, -10) ?? "",
        email,
        phone: user.phone ?? "",
        injected: true,
      })
      .onConflictDoNothing()
      .returning({ id: uniRegs.id });

    if (!inserted[0]) {
      return {
        success: false,
        status: "ALREADY_WHITELISTED",
        message: `${email} is already whitelisted.`,
        email,
      };
    }

    revalidatePath(`/check-in/${teamId}`);
    return {
      success: true,
      status: "OVERRIDDEN",
      message: `Whitelist override added for ${email}.`,
      email,
    };
  } catch (error) {
    console.error("Override failed", error);
    return {
      success: false,
      status: "UNKNOWN_ERROR",
      message: "Failed to add override. Please try again.",
    };
  }
}
