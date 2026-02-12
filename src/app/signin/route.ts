import { signIn } from "@/app/(auth)/auth";
import type { NextRequest } from "next/server";

const DEFAULT_CALLBACK_URL = "/";

const getSafeCallbackUrl = (request: NextRequest): string => {
  const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
  if (!callbackUrl || !callbackUrl.startsWith("/")) {
    return DEFAULT_CALLBACK_URL;
  }

  if (
    callbackUrl.startsWith("/api/auth") ||
    callbackUrl.startsWith("/signin")
  ) {
    return DEFAULT_CALLBACK_URL;
  }

  return callbackUrl;
};

export async function GET(request: NextRequest) {
  const callbackUrl = getSafeCallbackUrl(request);
  const redirectUrl = await signIn("google", {
    redirect: false,
    redirectTo: callbackUrl,
  });

  return Response.redirect(redirectUrl, 302);
}
