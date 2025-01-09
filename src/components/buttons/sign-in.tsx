'use client';

import Signin from "../../app/(auth)/authactions/signin"

export default function SignInButton() {
  const handleSignIn = async () => {
    try {
      await Signin();
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  }
  return (
    <button onClick={handleSignIn} type="submit" className="bg-[#39234E] p-5 w-[12vw] border-4 border-[#9B52E0] rounded-full font-bold">
      Signin with Google
    </button>
  )
}
