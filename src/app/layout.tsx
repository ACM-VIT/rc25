import React, { type ReactNode } from "react";
import { prisma } from "@/utils/prisma";
import "./globals.css";
import { Outfit } from "next/font/google";
// import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
// import moment from "moment-timezone";
import type { Metadata } from "next";
import { auth } from "./(auth)/auth";
import { cookies } from "next/headers";
import { switchAdminAction } from "@/app/actions/switch-admin-action";
import SynesthesiaWidget from "@/components/synesthia-widget";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reverse Coding | ACM-VIT",
  description: "ACM-VIT's premier competitive coding event",
  openGraph: {
    title: "Reverse Coding | ACM-VIT",
    description: "ACM-VIT's premier competitive coding event",
    type: "website",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

interface LayoutProps {
  children: ReactNode;
  admin: ReactNode;
}

export default async function RootLayout({ children, admin }: LayoutProps) {
  const session = await auth();

  if (!session?.user?.email) {
    return (
      <html lang="en">
        <body className={outfit.className}>
          {children}
          <Toaster />
        </body>
      </html>
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { Admin: true },
  });
  const isAdmin = !!user?.Admin;

  const cookieStore = await cookies();
  const currentMode = cookieStore.get("mode")?.value;
  const modeIsAdmin = currentMode !== "user";

  if (isAdmin && modeIsAdmin) {
    return (
      <html lang="en">
        <body
          className={`min-h-screen flex flex-col ${outfit.className}`}
          style={{ backgroundColor: "#fff" }}
        >
          {admin}
          <Toaster />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body
        className={`min-h-screen flex flex-col ${outfit.className}`}
        style={{
          backgroundImage: "url('/Dashboard.png')",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
        }}
      >
        {children}
        <Toaster />
        <SynesthesiaWidget />

        {isAdmin && currentMode === "user" && (
          <div className="fixed bottom-4 left-4 opacity-0 hover:opacity-100 transition-opacity">
            <form action={switchAdminAction}>
              <input type="hidden" name="mode" value="admin" />
              <button
                type="submit"
                className="px-3 py-1 rounded-md bg-blue-500 text-white"
              >
                Switch to Admin Mode
              </button>
            </form>
          </div>
        )}
      </body>
    </html>
  );
}
