import type React from "react";
import LandOne from "@/components/landing/landone";
import LandingNavbar from "@/components/landing/landing-navbar";
import HowItWorks from "@/components/landing/howitworks";
import PrizePool from "@/components/landing/prizepool";
import { Timeline } from "@/components/landing/timeline";
import FaqRegister from "@/components/landing/faqregister";
import SponsorsSection from "@/components/landing/sponsors";
import Footer from "@/components/landing/footer";
import Landing from "@/components/landing/new-pc/landing";
import TimeLine from "@/components/landing/new-pc/timeline";

const Page: React.FC = () => {
  return (
    <div className="overflow-x-hidden bg-black min-h-screen text-white">
      <TimeLine />
    </div>
  );
};

export default Page;
