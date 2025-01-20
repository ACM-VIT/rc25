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
const Page: React.FC = () => {
  const timelineData = [
    {
      title: "8:30 am",
      content: <p className="text-neutral-300">Report At the Venue</p>,
    },
    {
      title: "9:30 am",
      content: <p className="text-neutral-300">Registrations Close</p>,
    },
    {
      title: "10:00 am",
      content: <p className="text-neutral-300">Round 1</p>,
    },
    {
      title: "1:00 pm",
      content: <p className="text-neutral-300">Lunch Break</p>,
    },
    {
      title: "2:00 pm",
      content: <p className="text-neutral-300">Round 2</p>,
    },
    {
      title: "5:00 pm",
      content: <p className="text-neutral-300">Closing Ceremony</p>,
    },
  ];

  return (
    <div className="overflow-x-hidden bg-black min-h-screen text-white">
      <Landing />
    </div>
  );
};

export default Page;
