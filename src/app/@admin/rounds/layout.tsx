"use client";

import { HeroUIProvider } from "@heroui/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <HeroUIProvider>{children}</HeroUIProvider>
    </div>
  );
}
