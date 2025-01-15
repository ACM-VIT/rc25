"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import RCLogo from "@/app/assets/RCLogo.svg";
import { User as AvatarIcon } from "lucide-react";
import SignOut from "@/app/(auth)/authactions/signout";
import Link from "next/link";

interface NavbarProps {
    name: string;
}

function NavbarItem({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    return (
        <li>
            <Link
                href={href}
                className="block py-2 px-4 text-sm md:text-base group"
            >
                {children}
                <span className="block text-center max-w-0 group-hover:max-w-full transition-all duration-200 h-0.5 bg-primary"></span>
            </Link>
        </li>
    );
}

const Navbar: React.FC<NavbarProps> = ({ name }) => {
    const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);
    const dropdownRef = useRef<HTMLLIElement>(null);

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
        ) {
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
            className="w-full h-[15%] hidden md:block bg-[radial-gradient(110.8%_70.71%_at_50%_50%,_#0B0014_55.41%,_#18181B_100%)] border-b-[2px] border-gray-400/30"
        >
            <div className="flex h-full flex-row justify-between items-center mx-auto px-4 sm:px-6 md:px-4 max-w-9xl mb-3">
                <div className="h-full">
                    <Image
                        src={RCLogo}
                        alt="LOGO"
                        className="h-[80%] w-[80%]"
                    />
                </div>
                <ul className="flex flex-row gap-4 sm:gap-6 md:gap-8 list-none justify-center items-center">
                    <li className="group relative">
                        <a
                            href="#"
                            className="block py-2 px-4 text-white font-bold text-sm md:text-base hover:text-primary transition-colors duration-300"
                        >
                            Dashboard
                        </a>
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </li>
                    <li className="group relative">
                        <a
                            href="#"
                            className="block py-2 px-4 text-white font-bold text-sm md:text-base hover:text-primary transition-colors duration-300"
                        >
                            Submissions
                        </a>
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </li>
                    <li className="group relative">
                        <a
                            href="#"
                            className="block py-2 px-4 text-white font-bold text-sm md:text-base hover:text-primary transition-colors duration-300"
                        >
                            Instructions
                        </a>
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </li>
                    <li className="group relative">
                        <a
                            href="#"
                            className="block py-2 px-4 text-white font-bold text-sm md:text-base hover:text-primary transition-colors duration-300"
                        >
                            FAQs
                        </a>
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </li>
                    <li className="relative z-10" ref={dropdownRef}>
                        <button
                            className="flex items-center gap-2 bg-primary hover:bg-[#39234E] py-2 px-4 rounded-full transition-colors duration-300"
                            onClick={toggleDropdown}
                        >
                            <AvatarIcon size={20} className="text-white" />
                        </button>
                        {isDropdownOpen && (
                            <div
                                className="absolute top-full mt-2 right-0 bg-[#1E1E24] text-white rounded-lg shadow-lg py-2 w-48"
                            >
                                <a
                                    href="#profile"
                                    className="block px-4 py-2 text-center w-full hover:bg-[#39234E]"
                                >
                                    {name}
                                </a>
                                <button
                                    onClick={SignOut}
                                    className="block px-4 py-2 w-full hover:bg-[#39234E]"
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
