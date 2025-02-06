import { Metadata } from "next";
import ScrollWrapper from "./ScrollWrapper";

export const metadata: Metadata = {
  title: "Reverse Coding | ACM-VIT",
  description:
    "Join ACM-VIT's premier competitive coding event featuring exciting challenges, prizes and more!",
  openGraph: {
    title: "Reverse Coding",
    description: "ACM-VIT's premier competitive coding event",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function Page() {
  return <ScrollWrapper />;
}
