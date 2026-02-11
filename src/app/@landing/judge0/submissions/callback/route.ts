import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// DEPRECATED – Judge0 callbacks are now handled by the Upstash Workflow
// webhook endpoints (see src/workflows/submission.ts).
//
// This stub remains to gracefully handle any in-flight Judge0 callbacks that
// were dispatched before the migration. It simply acknowledges the request
// so Judge0 does not retry.
// ---------------------------------------------------------------------------

export async function PUT() {
  return NextResponse.json(
    { message: "Callback handled by workflow webhooks" },
    { status: 200 },
  );
}
