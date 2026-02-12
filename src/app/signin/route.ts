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

const getSetCookies = (headers: Headers): string[] => {
  const headersWithGetSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
  };
  if (typeof headersWithGetSetCookie.getSetCookie === "function") {
    return headersWithGetSetCookie.getSetCookie();
  }

  const raw = headers.get("set-cookie");
  return raw ? [raw] : [];
};

const appendSetCookies = (target: Headers, source: Headers) => {
  for (const cookie of getSetCookies(source)) {
    target.append("set-cookie", cookie);
  }
};

const getCookieHeaderForNextRequest = (
  incomingCookieHeader: string | null,
  setCookieHeaders: string[],
) => {
  const cookies: string[] = [];

  if (incomingCookieHeader) {
    cookies.push(incomingCookieHeader);
  }

  for (const setCookieHeader of setCookieHeaders) {
    const cookiePair = setCookieHeader.split(";")[0]?.trim();
    if (cookiePair) {
      cookies.push(cookiePair);
    }
  }

  return cookies.join("; ");
};

const signInInitFailedResponse = () =>
  new Response("Unable to start sign in. Please retry.", { status: 500 });

export async function GET(request: NextRequest) {
  const callbackUrl = getSafeCallbackUrl(request);

  const csrfUrl = new URL("/api/auth/csrf", request.url);
  const incomingCookieHeader = request.headers.get("cookie");
  const csrfResponse = await fetch(csrfUrl, {
    method: "GET",
    headers: incomingCookieHeader ? { cookie: incomingCookieHeader } : {},
    cache: "no-store",
  });

  if (!csrfResponse.ok) {
    return signInInitFailedResponse();
  }

  const csrfData = (await csrfResponse.json()) as { csrfToken?: string };
  if (!csrfData.csrfToken) {
    return signInInitFailedResponse();
  }

  const csrfSetCookies = getSetCookies(csrfResponse.headers);
  const postCookieHeader = getCookieHeaderForNextRequest(
    incomingCookieHeader,
    csrfSetCookies,
  );

  const signinUrl = new URL("/api/auth/signin/google", request.url);
  const signinResponse = await fetch(signinUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      ...(postCookieHeader ? { cookie: postCookieHeader } : {}),
    },
    body: new URLSearchParams({
      csrfToken: csrfData.csrfToken,
      callbackUrl,
    }),
    redirect: "manual",
    cache: "no-store",
  });

  const nextLocation = signinResponse.headers.get("location");
  if (!nextLocation) {
    return signInInitFailedResponse();
  }

  const response = Response.redirect(new URL(nextLocation, request.url), 302);
  appendSetCookies(response.headers, csrfResponse.headers);
  appendSetCookies(response.headers, signinResponse.headers);

  return response;
}
