import React, { type ReactNode } from "react";
import { prisma } from "@/utils/prisma";
import "./globals.css";
import { Outfit } from "next/font/google";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import moment from "moment-timezone";
import type { Metadata } from "next";
import { auth } from "./(auth)/auth";

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
  landing: ReactNode;
}

export default async function RootLayout({ children, admin, landing }: LayoutProps) {
  const session = await auth();
  if (!session?.user?.email) {
    return (
      <html lang="en">
        <body className={outfit.className}>
          {landing}
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
          backgroundImage: "url('./dashbg.png')",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
        }}
      >
        {/* <Navbar name={session.user.name || "User"} /> */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
