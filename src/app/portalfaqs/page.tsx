import PortalFaqs from "./portal-faqs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about the Reverse Coding competition",
  openGraph: {
    title: "FAQ",
    description: "Find answers to common questions about Reverse Coding",
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

const Page = () => {
  return <PortalFaqs />;
};

export default Page;
