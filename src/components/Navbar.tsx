import React from "react";
import Image from "next/image";
import RCLogo from "@/app/assets/RCLogo.svg";
import { User as AvatarIcon } from "lucide-react";

interface NavbarProps {
    name:string;
}

const Navbar: React.FC<NavbarProps> = ({name}) => {
    return (
        <nav
            className="pt-1 pb-1"
            style={{
                background: "radial-gradient(circle, #18181B 55%, #08000F 100%)",
            }}
        >

            <div className="flex flex-row justify-between items-center mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
                <div>
                    <Image src={RCLogo} alt="LOGO" className="w-18 h-[10vh]"/>
                </div>
                <ul className="flex flex-row gap-4 sm:gap-6 md:gap-8 list-none items-center">
                    <li>
                        <a
                            href="#"
                            className="block py-2 px-4 text-white font-bold text-sm md:text-base hover:text-[#39234E] hover:underline"
                        >
                            Dashboard
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            className="block py-2 px-4 text-white font-bold text-sm md:text-base hover:text-[#39234E] hover:underline"
                        >
                            Submissions
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            className="block py-2 px-4 text-white font-bold text-sm md:text-base hover:text-[#39234E] hover:underline "
                        >
                            FAQ
                        </a>
                    </li>
                    <li>
                        <button className="flex items-center gap-2 bg-[#39234E] py-2 px-4 rounded-full">
                            <AvatarIcon size={20} className="text-white"/>
                            <span className="text-white font-bold text-sm md:text-base">{name}</span>
                        </button>
                    </li>

                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
