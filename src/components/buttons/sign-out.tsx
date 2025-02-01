"use client"
import SignOut from "@/app/(auth)/authactions/signout"

export default function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await SignOut();
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };
  
  return (
    <button 
      type="button"
      onClick={handleSignOut} 
      className="bg-[#39234E] px-8 py-3 rounded-lg border-2 border-[#9B52E0] 
                font-semibold text-white hover:bg-[#4a2b63] transition-colors"
    >
      Sign Out
    </button>
  );
}