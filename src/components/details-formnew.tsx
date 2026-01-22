"use client";
import { useState } from "react";
import onboard from "@/app/actions/onboard";
import { useFormStatus } from "react-dom";
import { useSession } from "next-auth/react";
import parsePhoneNumber from "libphonenumber-js";
import Image from "next/legacy/image";
import bg from "@/app/assets/detailsbg.svg";
import SignOut from "@/app/(auth)/authactions/signout";
import RC from "@/app/assets/RCLogo.svg";

import { Outfit } from "next/font/google";

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

    const { pending } = useFormStatus();

    return (
        <div className="relative h-screen w-full overflow-hidden bg-[#1a1a2e]">
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
            <div className="relative z-30 flex justify-center flex-col h-full w-full sm:mt-2">
                <div className="flex flex-row w-full h-1/12 justify-end items-center lg:p-4 ">
                    <button
                        type="button"
                        className="absolute top-3 right-1 transform -translate-x-1/2 text-center w-24 sm:w-28 md:w-32 p-4 py-2 rounded-md 
                 border bg-[#08000F] border-[#CEB7FF] text-[#CEB7FF] 
                 uppercase hover:bg-[#CEB7FF] hover:text-black 
                 transition-all duration-300 shadow-lg text-sm sm:text-base"
                        onClick={async () => {
                            await SignOut();
                        }}
                    >
                        Logout
                    </button>
                </div>
                <div className="flex flex-col w-full h-full justify-center items-center">
                    <div className="w-[85vw] lg:w-[65vw] text-center relative h-full flex flex-col items-center justify-center mb-16 sm:mb-24 lg:mb-0">
                        <div className="box-border w-[85vw] lg:w-[65vw] h-[70vh] bg-[#08000F] bg-opacity-60 border overflow-y-auto border-[#9B51E0] relative px-8 py-8 xs-sm:px-8 xs-sm:py-8  phone:px-1 phone:py-1 lg:px-10 lg:py-12 xl:px-12 xl:py-6">
                            <div className="flex text-center flex-row items-center justify-center gap-x-4 w-full ">
                                <div
                                    className="w-2/3 h-[10px] bg-transparent border border-[#CEB7FF]"
                                    style={{
                                        boxShadow:
                                            "0 0 10px #CEB7FF, 0 0 10px #CEB7FF, 0 0 30px #CEB7FF",
                                    }}
                                />
                                <div className="w-sm text-center text-[#CEB7FF] lg:text-center md:text-right text-sm  text-nowrap md:text-sm lg:text-[100%] how-it-works-heading ">
                                    A MESSAGE FROM ACM
                                </div>
                            </div>

                            <h1
                                className="text-white text-[20px] sm:text-[20px] md:text-[40px] lg:text-[40px] xl:text-[60px]
                          tracking-wide px-6 py-0 how-it-works-heading uppercase"
                                style={{
                                    color: "transparent",
                                    WebkitTextStroke: "2px #CEB7FF",
                                    textShadow: "none",
                                }}
                            >
                                HELLO {userName}
                            </h1>
                            <div className="flex text-center flex-row items-center justify-center w-full gap-x-4">
                                <div className="w-sm text-[#CEB7FF] lg:text-center md:text-left text-sm text-nowrap md:text-sm lg:text-[100%] how-it-works-heading ">
                                    A MESSAGE FROM ACM
                                </div>
                                <div
                                    className="w-2/3 h-[10px] bg-transparent border border-[#CEB7FF]"
                                    style={{
                                        boxShadow:
                                            "0 0 10px #CEB7FF, 0 0 10px #CEB7FF, 0 0 30px #CEB7FF",
                                    }}
                                />
                            </div>

                            <div className="text-[#CEB7FF] text-md lg:text-xl lg:font-bold  text-center my-2 lg:my-5 ">
                                Please provide us with the following information
                                for a seamless experience
                            </div>

                            <form
                                action={onboard}
                                className="flex flex-col space-y-4"
                                onSubmit={(e) => {
                                    const parsedPhone = parsePhoneNumber(
                                        phone,
                                        "IN"
                                    );
                                    if (
                                        !parsedPhone ||
                                        !parsedPhone.isValid()
                                    ) {
                                        e.preventDefault();
                                        setPhoneError("Invalid Phone Number");
                                    } else {
                                        setPhoneError("");
                                    }
                                    if (selectedGender === "") {
                                        e.preventDefault();
                                        setGenderError(
                                            "Please select your Gender"
                                        );
                                    }
                                    if (selectStatus === "") {
                                        e.preventDefault();
                                        setStatusError(
                                            "Please select an Option"
                                        );
                                    }
                                }}
                            >
                                {/* Phone Number */}
                                <label
                                    htmlFor="phone"
                                    className="text-white text-left text-sm"
                                >
                                    Contact Number
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    className="w-full p-2 bg-[#CEB7FF] bg-opacity-20 border border-[#F0F1FA] text-white focus:ring focus:ring-[#9B51E0]"
                                    placeholder="Enter your phone number"
                                    onChange={(e) =>
                                        setPhone(
                                            e.target.value.replace(
                                                /[^0-9]/g,
                                                ""
                                            )
                                        )
                                    }
                                    value={phone}
                                />
                                <div className="text-red-600 text-xs">
                                    {phoneError}
                                </div>

                                {/* Gender Selection */}
                                <label
                                    htmlFor="gender-group"
                                    className="text-white text-left text-sm"
                                >
                                    Gender
                                </label>
                                <fieldset
                                    id="gender-group"
                                    aria-label="Gender Selection"
                                    className="flex gap-4 border-0"
                                >
                                    {["male", "female"].map((gender) => (
                                        <label
                                            key={gender}
                                            className="flex-1 cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name="gender"
                                                value={gender}
                                                className="hidden"
                                                checked={
                                                    selectedGender === gender
                                                }
                                                onChange={() =>
                                                    setSelectedGender(gender)
                                                }
                                            />
                                            <div
                                                className={`p-3 text-center border border-[#F0F1FA] text-sm font-semibold
                                    ${
                                        selectedGender === gender
                                            ? "bg-[#CEB7FF] bg-opacity-9 text-black"
                                            : "bg-[#CEB7FF] bg-opacity-20 text-white"
                                    }`}
                                            >
                                                {gender.toUpperCase()}
                                            </div>
                                        </label>
                                    ))}
                                </fieldset>
                                <div className="text-red-600 text-xs">
                                    {genderError}
                                </div>

                                {/* Status Selection */}
                                {/* Status Selection */}
                                <div className="text-white text-sm flex items-start justify-start">
                                    Are you a Hosteller?
                                </div>
                                <fieldset
                                    id="status-group"
                                    aria-label="Hosteller Status"
                                    className="flex gap-4 border-0"
                                >
                                    {["HOSTELLER", "DAY SCHOLAR"].map(
                                        (status) => (
                                            <label
                                                key={status}
                                                className="flex-1 cursor-pointer"
                                            >
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value={status}
                                                    className="hidden"
                                                    checked={
                                                        selectStatus === status
                                                    }
                                                    onChange={() =>
                                                        setSelectStatus(status)
                                                    }
                                                />
                                                <div
                                                    className={`p-3 text-center border border-[#F0F1FA] text-sm font-semibold
                    ${
                        selectStatus === status
                            ? "bg-[#CEB7FF] bg-opacity-9 text-black"
                            : "bg-[#CEB7FF] bg-opacity-20 text-white"
                    }`}
                                                >
                                                    {status}
                                                </div>
                                            </label>
                                        )
                                    )}
                                </fieldset>
                                <div className="text-red-600 text-xs">
                                    {statusError}
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-center w-full mt-4 sm:mt-5 mb-4 sm:mb-5">
                                    <button
                                        type="submit"
                                        className={`
      w-full sm:w-auto 
      px-4 sm:px-8 
      py-2 sm:py-3 
      bg-[#9B51E0] 
      text-white 
      text-base sm:text-xl 
      hover:bg-[#a765e0] 
      ${outfit.className}
    `}
                                        style={{
                                            color: "transparent",
                                            WebkitTextStroke: "1px white",
                                            textShadow: "none",
                                        }}
                                        disabled={pending}
                                    >
                                        {pending
                                            ? "JOINING..."
                                            : "JOIN THE COUNCIL"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 p-4">
                    <Image
                        alt="Reverse Coding Logo"
                        src={RC || "/placeholder.svg"}
                        width={100}
                        height={100}
                        className="transform scale-100"
                        priority
                    />
                </div>
            </div>
        </div>
    );
}
