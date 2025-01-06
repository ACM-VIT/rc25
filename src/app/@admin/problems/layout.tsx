import "@/app/globals.css";
import { PrismaClient } from "@prisma/client";
import type { ReactNode } from "react";

async function getRounds() {
  const prisma = new PrismaClient();
  try {
    return await prisma.round.findMany({
      orderBy: { number: "asc" },
    });
  } finally {
    await prisma.$disconnect();
  }
}

interface LayoutProps {
  children: ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const rounds = await getRounds();
  return <>{children}</>;
}