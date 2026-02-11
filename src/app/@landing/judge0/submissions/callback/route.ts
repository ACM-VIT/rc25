import { type NextRequest, NextResponse } from "next/server";
import { judge0CallbackHook, type Judge0Response } from "@/workflows/judge0-submission";

export async function PUT(request: NextRequest) {
  try {
    const hookToken = request.nextUrl.searchParams.get("hookToken");
    if (!hookToken) {
      return NextResponse.json(
        { message: "Missing hookToken query parameter" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as Judge0Response;
    if (!body?.token) {
      return NextResponse.json(
        { message: "Missing submission token" },
        { status: 400 },
      );
    }

    await judge0CallbackHook.resume(hookToken, {
      response: body,
      submissionId: request.nextUrl.searchParams.get("submissionId") ?? undefined,
      testcaseId: request.nextUrl.searchParams.get("testcaseId") ?? undefined,
      testcaseIndex:
        request.nextUrl.searchParams.get("testcaseIndex") ?? undefined,
    });

    return NextResponse.json({ message: "Callback accepted" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error processing Judge0 callback request", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
