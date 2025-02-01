"use client";
import Link from "next/link";
import SignOutButton from "./buttons/sign-out";

export function Navbar() {
  return (
    <nav className="bg-[#1a1a1a] border-b border-[#2a2a2a] p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link 
          href="/" 
          className="bg-[#39234E] px-8 py-3 rounded-lg border-2 border-[#9B52E0] 
                     font-semibold text-white hover:bg-[#4a2b63] transition-colors"
        >
          Home
        </Link>
        <SignOutButton />
      </div>
    </nav>
  );
}