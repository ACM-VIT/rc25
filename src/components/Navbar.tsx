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

function NavbarItem({ href, children }: { href: string, children: React.ReactNode }) {
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
        <nav className="bg-black/40 border-b-2 border-rcgrey/20 text-text flex flex-row justify-between items-center mx-auto px-4 w-full">
            <div>
                <Image src={RCLogo} alt="LOGO" className="w-4/5" />
            </div>
            <ul className="flex flex-row gap-4 md:gap-6 list-none items-center">
                <NavbarItem href="#">
                    Dashboard
                </NavbarItem>
                <NavbarItem href="#">
                    Submissions
                </NavbarItem>
                <NavbarItem href="#">
                    Instructions
                </NavbarItem>
                <NavbarItem href="#">
                    FAQ
                </NavbarItem>
                <li className="relative z-10" ref={dropdownRef}>
                    <button
                        className="flex items-center gap-2 bg-primary py-2 px-2 rounded-full"
                        onClick={toggleDropdown}
                    >
                        <AvatarIcon size={20} className="text-text" />
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute top-full mt-2 right-0 bg-[#1E1E24] rounded-lg shadow-lg py-2 w-48">
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
        </nav>
    );
};

export default Navbar;
