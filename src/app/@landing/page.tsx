import type React from "react";
import NewLandOne from "../../components/landing/new-pc/newlandone";
import HowItWorks from "../../components/landing/new-pc/howItWorks";
import Allies from "../../components/landing/new-pc/allies";

const Layout: React.FC = () => {
  return (
    <div className="relative w-screen h-dvh overflow-hidden">
      <div
        className="flex overflow-x-auto overflow-y-hidden scroll-smooth"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="flex-none w-screen h-full">
          <NewLandOne />
        </div>
        <div className="flex-none w-screen h-full">
          <HowItWorks />
        </div>
        <div className="flex-none w-screen h-full">
          <Allies />
        </div>
      </div>
    </div>
  );
};

export default Layout;
