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
      <button onClick={handleSignOut} type="submit" className="bg-[#39234E] p-5 w-[12vw] border-4 border-[#9B52E0] rounded-full font-bold ">SignOut</button>

  )
}