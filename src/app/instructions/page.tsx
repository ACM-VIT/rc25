import Instructions from "./instructions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instructions",
  description: "Competition rules and guidelines for Reverse Coding",
  openGraph: {
    title: "Instructions",
    description: "Learn how to participate in Reverse Coding competition",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const Page = () => {
  return <Instructions />;
};

export default Page;
