"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import RCLogo from "@/app/assets/RCLogo.svg";
import { User as AvatarIcon } from "lucide-react";
import SignOut from "@/app/(auth)/authactions/signout";

interface NavbarProps {
    name: string;
}

const Navbar: React.FC<NavbarProps> = ({ name }) => {
    const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };

    useEffect(() => {
        if (isDropdownOpen) {
            document.addEventListener("click", handleClickOutside);
        } else {
            document.removeEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <nav
            className="pt-1 pb-1"
            style={{
                background: "radial-gradient(circle, #18181B 55%, #08000F 100%)",
            }}
        >
            <div className="flex flex-row justify-between items-center mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
                <div>
                    <Image src={RCLogo} alt="LOGO" className="w-18 h-[10vh]" />
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
                            className="block py-2 px-4 text-white font-bold text-sm md:text-base hover:text-[#39234E] hover:underline"
                        >
                            FAQ
                        </a>
                    </li>
                    <li className="relative z-10" ref={dropdownRef}>
                        <button
                            className="flex items-center gap-2 bg-[#39234E] py-2 px-4 rounded-full"
                            onClick={toggleDropdown}
                        >
                            <AvatarIcon size={20} className="text-white" />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute top-full mt-2 right-0 bg-[#1E1E24] text-white rounded-lg shadow-lg py-2 w-48">
                                <a
                                    href="#profile"
                                    className="block px-4 py-2 hover:bg-[#39234E]"
                                >
                                    {name}
                                </a>
                                <button
                                    onClick={SignOut}
                                    className="block px-4 py-2 w-[15vw] hover:bg-[#39234E]"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
