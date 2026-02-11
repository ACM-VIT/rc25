"use client";

import Header from "@/components/Header";
import Signin from "@/app/(auth)/authactions/signin";
import { formula1Bold } from "@/lib/fonts";

interface FallbackScreenProps {
  title: string;
  message: string;
  headerTitle?: string;
  actionLabel?: string;
  actionHref?: string;
  googleSignIn?: boolean;
  onAction?: () => void;
}

export default function FallbackScreen({
  title,
  message,
  headerTitle,
  actionLabel,
  actionHref,
  googleSignIn,
  onAction,
}: FallbackScreenProps) {
  return (
    <div
      className="relative flex h-screen w-full flex-col items-center overflow-hidden"
      style={{
        backgroundImage: "url('/Dashboard.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {headerTitle && <Header title={headerTitle} />}

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        {/* Glowing accent line */}
        <div className="h-[3px] w-24 rounded-full bg-[#A7282D] shadow-[0_0_12px_rgba(167,40,45,0.6)]" />

        <h1
          className={`${formula1Bold.className} text-center text-xl text-white sm:text-2xl md:text-4xl`}
        >
          {title}
        </h1>

        <p
          className={`${formula1Bold.className} max-w-md text-center text-xs leading-relaxed text-white/60 sm:text-sm md:text-base`}
        >
          {message}
        </p>

        {/* Glowing accent line */}
        <div className="h-[3px] w-24 rounded-full bg-[#A7282D] shadow-[0_0_12px_rgba(167,40,45,0.6)]" />

        {actionLabel && (googleSignIn || actionHref || onAction) && (
          googleSignIn ? (
            <button
              onClick={async () => {
                try {
                  await Signin();
                } catch (error) {
                  console.error("Error during sign-in:", error);
                }
              }}
              className={`${formula1Bold.className} mt-4 cursor-pointer rounded-lg border-2 border-[#A7282D] bg-black/50 px-8 py-3 text-sm text-white shadow-[0_0_20px_rgba(167,40,45,0.4)] transition-all duration-300 hover:bg-[#A7282D]/30 hover:shadow-[0_0_30px_rgba(167,40,45,0.6)] sm:text-base`}
            >
              {actionLabel}
            </button>
          ) :
          actionHref ? (
            <a
              href={actionHref}
              className={`${formula1Bold.className} mt-4 rounded-lg border-2 border-[#A7282D] bg-black/50 px-8 py-3 text-sm text-white shadow-[0_0_20px_rgba(167,40,45,0.4)] transition-all duration-300 hover:bg-[#A7282D]/30 hover:shadow-[0_0_30px_rgba(167,40,45,0.6)] sm:text-base`}
            >
              {actionLabel}
            </a>
          ) : (
            <button
              onClick={onAction}
              className={`${formula1Bold.className} mt-4 cursor-pointer rounded-lg border-2 border-[#A7282D] bg-black/50 px-8 py-3 text-sm text-white shadow-[0_0_20px_rgba(167,40,45,0.4)] transition-all duration-300 hover:bg-[#A7282D]/30 hover:shadow-[0_0_30px_rgba(167,40,45,0.6)] sm:text-base`}
            >
              {actionLabel}
            </button>
          )
        )}
      </div>
    </div>
  );
}
