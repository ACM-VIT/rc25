"use client";
import React, { useState } from "react";
import onboard from "../app/actions/onboard";
import { useFormStatus } from "react-dom";
import { useSession } from "next-auth/react";
import parsePhoneNumber from "libphonenumber-js";
import Image from "next/image";
import logo from "@/app/assets/RCLogo.svg";
import bg from "@/app/assets/detailsbg.svg";
import SignOut from "@/app/(auth)/authactions/signout";

import { PT_Sans } from "next/font/google";
import { Outfit } from "next/font/google";

const pt_sans = PT_Sans({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});
export default function OnboardingForm() {
  const [selectedGender, setSelectedGender] = useState("");
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0];
  const [phone, setPhone] = useState("");
  const [selectStatus, setSelectStatus] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [statusError, setStatusError] = useState("");

  return (
    <div className="relative flex items-center justify-center min-h-screen w-full overflow-hidden pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bg}
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>
      <Image
        src={logo}
        alt="rclogo"
        className="absolute md:bottom-[-13%] lg:bottom-[-18%] xl:bottom-[-23%] left-[3%] w-auto h-[12%] sm:h-[10%]  md:h-[25%] lg:h-[30%] xl:h-[37%] md:block hidden"
      />

      <button
        type="button"
  className="absolute top-[4%] right-[5%] sm:right-[3%] px-6 py-2 border 
             bg-[#08000F] border-[#CEB7FF] text-[#CEB7FF] uppercase 
             hover:bg-[#CEB7FF] hover:text-black transition-all duration-300 shadow-lg mt-[-2%] md:mt-[0] mb-[10%]"
        onClick={async () => {
          await SignOut(); // Call your signout function
        }}
      >
        Logout
      </button>

      {/* Form Container */}
      <div
        className="w-[85vw] md:w-[60vw] lg:w-[70vw] sm:w-[75vw] 
             min-h-[65vh] 
             p-6 phone:p-5
             flex flex-col box-border 
             bg-[#08000F] bg-opacity-60 border border-[#9B51E0] relative md:mt-[-5%] xl:mt-[-4%] mb-[5%]"
      >
        <form
          action={onboard}
          id="form"
          className="flex flex-col items-center w-full"
          onSubmit={(e) => {
            const parsedPhone = parsePhoneNumber(phone, "IN");
            if (!parsedPhone || !parsedPhone.isValid()) {
              e.preventDefault();
              setPhoneError("Invalid Phone Number");
            } else {
              setPhoneError("");
            }
            if (selectedGender === "") {
              e.preventDefault();
              setGenderError("Please select your Gender");
            }
            if (selectStatus === "") {
              e.preventDefault();
              setStatusError("Please select an Option");
            }
          }}
        >
          {/* Header with Proper Borders */}
          {/* Header with Proper Borders */}
          <div className="w-[80%] lg:w-[70%] mb-6 text-center relative flex flex-col items-center">
            {/* Top Horizontal Line (Always Left-Aligned) */}
            <div className="flex flex-row items-center w-full">
              {/* Line extending from left */}
              <div
                className="w-2/3 h-[10px] bg-transparent border border-[#CEB7FF]"
                style={{
                  boxShadow:
                    "0 0 10px #CEB7FF, 0 0 10px #CEB7FF, 0 0 30px #CEB7FF",
                }}
              />

              {/* Text aligned next to it */}
              <div className="w-1/3 text-[#CEB7FF] lg:text-center md:text-right md:block hidden text-nowrap md:text-[85%] lg:text-[100%] how-it-works-heading uppercase">
                A MESSAGE FROM ACM
              </div>
            </div>

            {/* HELLO NAME Text */}
            <h1
              className="text-white text-[2rem] sm:text-[2rem] md:text-[2rem] lg:text-[3rem] 
               tracking-wide px-6 py-2 how-it-works-heading uppercase"
              style={{
                color: "transparent",
                WebkitTextStroke: "2px #CEB7FF",
                textShadow: "none",
              }}
            >
              HELLO {userName}
            </h1>

            {/* Bottom Horizontal Line (Changes Only for `sm` and Below) */}
            <div className="w-full flex flex-row-reverse md:flex-row items-center">
              {/* Text for md and above stays default, for sm moves to right */}
              <div className="flex-grow text-[#CEB7FF] lg:text-center md:text-left md:block hidden text-nowrap md:text-[85%] lg:text-[100%] how-it-works-heading uppercase">
                A MESSAGE FROM ACM
              </div>

              {/* Line extending from text */}
              <div
                className="w-2/3 h-[10px] bg-transparent border border-[#CEB7FF]"
                style={{
                  boxShadow:
                    "0 0 10px #CEB7FF, 0 0 10px #CEB7FF, 0 0 30px #CEB7FF",
                }}
              />
            </div>
          </div>

          <h2
            className={`text-[#CEB7FF] text-lg sm:text-xl lg:text-xl xl:text-2xl text-center mb-5 ${outfit.className}`}
          >
            Please provide us with the following information to ensure a
            seamless experience
          </h2>

          {/* Form Fields Container */}
          <div className="w-full max-w-xl px-4">
            {/* Phone Number */}
            <div className="mb-5">
              <label
                htmlFor="phone"
                className={`font-semibold text-white text-xs block mb-1 ${pt_sans.className}`}
              >
                CONTACT NUMBER
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full h-12  p-2 bg-[#CEB7FF] bg-opacity-20
                           box-border border border-[#F0F1FA] 
                           outline-none text-white text-lg"
                onChange={(e) => {
                  setPhone(e.target.value.replace(/[^0-9]/g, ""));
                }}
                value={phone}
              />
              <div className="text-red-600 text-xs mt-0.5">
                {phoneError}&nbsp;
              </div>
            </div>

            {/* Gender Selection */}
            {/* Gender Selection (Ensures correct form submission) */}
            <div className="mb-5">
              <label
                htmlFor="gender"
                className={`${pt_sans.className} font-semibold text-xs text-white block mb-1`}
              >
                GENDER
              </label>
              <fieldset
                className="flex flex-row gap-4 border-0 m-0 p-0"
              >
                <legend className="sr-only">Select your gender</legend>
                {["male", "female"].map((gender) => (
                  <label key={gender} className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      id="gender"
                      name="gender" // ✅ Important: Now included in form submission
                      value={gender}
                      className="hidden"
                      checked={selectedGender === gender}
                      onChange={(e) => setSelectedGender(e.target.value)}
                    />
                    <div
                      className={`p-3 text-center border border-[#F0F1FA] text-lg font-semibold
                      ${
                        selectedGender === gender
                          ? "bg-[#CEB7FF] bg-opacity-9 text-white"
                          : "bg-[#CEB7FF] bg-opacity-20 text-white"
                      }`}
                    >
                      {gender.toUpperCase()}
                    </div>
                  </label>
                ))}
              </fieldset>
              <div className="text-red-600 text-xs mt-0.5">
                {genderError}&nbsp;
              </div>
            </div>

            {/* Status Selection */}
            <div className="mb-5">
              <label
                htmlFor="status-options"
                className={`${pt_sans.className} font-semibold text-xs text-white block mb-1`}
              >
                SELECT AN OPTION
              </label>
              <fieldset 
                className="flex flex-col sm:flex-row gap-4" 
                id="status-options"
                aria-label="Status options"
              >
                <legend className="sr-only">Select your status</legend>
                {["HOSTELLER", "DAY SCHOLAR"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`flex-1 p-3 text-center border border-[#F0F1FA] text-lg font-semibold
                               ${
                                 selectStatus === status
                                   ? "bg-[#CEB7FF] bg-opacity-9.5 text-white"
                                   : "bg-[#CEB7FF] bg-opacity-20 text-white"
                               }`}
                    onClick={() => setSelectStatus(status)}
                  >
                    {status}
                  </button>
                ))}
              </fieldset>
              <div className="text-red-600 text-xs mt-0.5">
                {statusError}&nbsp;
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center w-full mt-5 mb-5 ">
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      id="submit_button"
      aria-disabled={pending}
      disabled={pending}
      className={`px-8 py-3 bg-[#9B51E0] text-white text-xl  hover:bg-[#a765e0] ${outfit.className}`}
      style={{
        color: "transparent",
        WebkitTextStroke: "1px white",
        textShadow: "none",
      }}
    >
      {pending ? "JOINING..." : "JOIN THE COUNCIL"}
    </button>
  );
}
