"use client";

import { teamAction } from "@/app/actions/team";
import SignOut from "@/app/(auth)/authactions/signout";
import { formula1Bold } from "@/lib/fonts";
import type React from "react";
import { useMemo, useState, useTransition } from "react";
import Header from "./Header";

type PendingAction = "join" | "create" | null;
type HelperMode = "join" | "create";

function getTeamActionErrorMessage(errorCode: number): string {
  switch (errorCode) {
    case 1:
      return "Team not found :(";
    case 2:
      return "Team name already taken :(";
    case 4:
      return "Team max capacity reached :(";
    case 10:
      return "Unknown error occurred. Please try again later :(";
    case 11:
      return "Team already checked in";
    default:
      return "";
  }
}

function GlowingButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${formula1Bold.className} mx-auto flex h-[56px] w-full max-w-[360px] items-center justify-center rounded-[13.158px] border-[4px] border-[#a7282d] bg-[linear-gradient(180.008deg,rgba(0,0,0,0.93)_0%,rgba(42,42,42,0.93)_176.23%)] text-center text-[18px] uppercase leading-[1.5] text-white shadow-[0px_0px_35.512px_0px_#9f242d,0px_0px_20.293px_0px_#9f242d,0px_0px_11.837px_0px_#9f242d,0px_0px_5.919px_0px_#9f242d,0px_0px_1.691px_0px_#9f242d,0px_0px_0.846px_0px_#9f242d] transition-[filter,opacity] duration-200 hover:brightness-110 active:brightness-125 disabled:opacity-60 sm:h-[64px] md:h-[76px] md:border-[6px] md:text-[28px]`}
    >
      {children}
    </button>
  );
}

export default function Team({ name }: { name: string }) {
  const [inputValue, setInputValue] = useState("");
  const [helperMode, setHelperMode] = useState<HelperMode>("create");
  const [errorText, setErrorText] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [pending, startTransition] = useTransition();

  const displayName = (name.split(" ")[0] ?? "User").trim();

  const maxLen = helperMode === "join" ? 6 : 10;
  const inputLen = inputValue.trim().length;
  const inputProgress = useMemo(
    () => Math.min(inputLen / maxLen, 1),
    [inputLen, maxLen],
  );

  const helperText =
    helperMode === "join"
      ? "Squad code should be 5-6 characters"
      : "Squad length should be between 4-10 characters";

  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#0c0c0c] max-sm:overflow-y-auto">
      <img
        src="/TeamDash/bgroad.svg"
        alt=""
        aria-hidden="true"
        className="-translate-x-1/2 pointer-events-none absolute bottom-0 left-1/2 h-[416px] w-[1847px] max-w-none"
      />

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center">
        <Header title={`Hello ${displayName}`} />

        <section className="mt-14 w-full max-w-[660px] px-6">
          <h2
            className={`${formula1Bold.className} text-center text-[22px] uppercase leading-[normal] text-white sm:text-[28px] md:text-[32px]`}
          >
            CREATE A SQUADRON
          </h2>
          <p
            className={`${formula1Bold.className} mt-4 text-center text-[14px] leading-[1.5] text-white sm:text-[16px] md:text-[20px]`}
          >
            What&apos;s your epic squad name?
          </p>
        </section>

        <section className="mt-10 w-full max-w-[660px] px-6">
          <label
            htmlFor="team_input"
            className={`${formula1Bold.className} block text-[14px] leading-[1.5] text-white sm:text-[16px] md:text-[20px]`}
          >
            Squad Name
          </label>

          <div className="mt-4 w-full">
            <div className="relative w-full bg-[#080a0d] md:h-[127.513px]">
              <div className="flex items-center gap-4 px-[22px] py-[28px] sm:px-[28px] sm:py-[36px] md:px-[33px] md:py-[41px]">
                <img
                  src="/TeamDash/usernameCardWheel.svg"
                  alt=""
                  aria-hidden="true"
                  className="h-8 w-8 shrink-0 opacity-95 md:h-[45px] md:w-[45px]"
                />
                <input
                  id="team_input"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="LaalMirchi"
                  maxLength={10}
                  value={inputValue}
                  onChange={(e) => {
                    setErrorText("");
                    setInputValue(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    setHelperMode("join");
                    const code = inputValue.trim().toUpperCase();
                    if (!code) {
                      setErrorText("Please enter a squad code");
                      return;
                    }
                    if (
                      code.length < 5 ||
                      code.length > 6 ||
                      !/^[A-Z0-9]+$/.test(code)
                    ) {
                      setErrorText("Invalid Team Code");
                      return;
                    }

                    setPendingAction("join");
                    startTransition(async () => {
                      try {
                        const res = await teamAction(code, false);
                        setErrorText(
                          getTeamActionErrorMessage(res?.error?.code ?? 0),
                        );
                      } finally {
                        setPendingAction(null);
                      }
                    });
                  }}
                  className={`${formula1Bold.className} w-full bg-transparent text-[20px] leading-[normal] text-white outline-none placeholder:text-white/35 sm:text-[24px] md:text-[29.426px]`}
                />
              </div>
              <div className="absolute left-0 right-0 bottom-[15.32px] h-[2px] bg-[#a7282d]" />
            </div>
            <div className="relative h-[13.487px] w-full overflow-hidden bg-[#222221]">
              <div
                aria-hidden="true"
                className="absolute inset-0 origin-left bg-[#a7282d] transition-transform duration-300 ease-out"
                style={{ transform: `scaleX(${inputProgress})` }}
              />
            </div>
          </div>

          <p
            className={`${formula1Bold.className} mt-2 text-[12px] leading-[1.5] text-[#a7282d] md:text-[16px]`}
          >
            {errorText || helperText}
          </p>
        </section>

        <section className="mt-20 w-full max-w-[360px] px-6 pb-24 md:mt-40 md:max-w-[760px]">
          <div className="flex w-full flex-col items-center gap-6 md:flex-row md:items-stretch md:justify-center md:gap-24">
            <div className="w-full md:w-1/2">
              <GlowingButton
                disabled={pending}
                onClick={() => {
                  setHelperMode("join");
                  setErrorText("");
                  const code = inputValue.trim().toUpperCase();
                  if (!code) return setErrorText("Please enter a squad code");
                  if (
                    code.length < 5 ||
                    code.length > 6 ||
                    !/^[A-Z0-9]+$/.test(code)
                  ) {
                    return setErrorText("Invalid Team Code");
                  }

                  setPendingAction("join");
                  startTransition(async () => {
                    try {
                      const res = await teamAction(code, false);
                      setErrorText(getTeamActionErrorMessage(res?.error?.code ?? 0));
                    } finally {
                      setPendingAction(null);
                    }
                  });
                }}
              >
                {pending && pendingAction === "join" ? "ENTERING..." : "ENTER"}
              </GlowingButton>
            </div>

            <p
              className={`${formula1Bold.className} text-center text-[22px] uppercase leading-[normal] text-white md:hidden`}
            >
              OR
            </p>

            <div className="w-full md:w-1/2">
              <GlowingButton
                disabled={pending}
                onClick={() => {
                  setHelperMode("create");
                  setErrorText("");
                  const squadName = inputValue.trim();
                  if (!squadName) return setErrorText("Please enter a squad name");
                  if (squadName.length < 4 || squadName.length > 10) {
                    return setErrorText("Squad length should be between 4-10 characters");
                  }
                  if (!/^[a-zA-Z0-9_ ]*$/.test(squadName)) {
                    return setErrorText("Squad name contains invalid characters");
                  }

                  setPendingAction("create");
                  startTransition(async () => {
                    try {
                      const res = await teamAction(squadName, true);
                      setErrorText(getTeamActionErrorMessage(res?.error?.code ?? 0));
                    } finally {
                      setPendingAction(null);
                    }
                  });
                }}
              >
                {pending && pendingAction === "create"
                  ? "CREATING..."
                  : "CREATE SQUAD"}
              </GlowingButton>
            </div>
          </div>
        </section>

        <div className="pointer-events-auto absolute bottom-6 right-6 hidden md:block">
          <button
            type="button"
            onClick={() => SignOut()}
            className="h-[39px] w-[160px] rounded-[8px] bg-[#a7282d] text-center text-[20px] font-bold leading-[normal] text-white transition-colors duration-200 hover:bg-[#8a2024] active:opacity-80"
          >
            Log Out
          </button>
        </div>

        <div className="pointer-events-auto mt-4 flex w-full max-w-[660px] justify-end px-6 pb-8 md:hidden">
          <button
            type="button"
            onClick={() => SignOut()}
            className="h-[36px] rounded-[8px] bg-[#a7282d] px-5 text-center text-[14px] font-bold leading-[normal] text-white transition-colors duration-200 hover:bg-[#8a2024] active:opacity-80"
          >
            Log Out
          </button>
        </div>
      </div>
    </main>
  );
}
