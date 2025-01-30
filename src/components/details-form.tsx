"use client";
import React from "react";
import onboard from "../app/actions/onboard";
import { useFormStatus } from "react-dom";
import parsePhoneNumber from "libphonenumber-js";
import { useState } from "react";
import Image from 'next/image'
import SignOut from "@/app/(auth)/authactions/signout";


export default function OnboardingForm({ name }: { name: string }) {
    const [selectedGender, setSelectedGender] = useState("");
    const [phone, setPhone] = useState("");
    const [selectStatus, setSelectStatus] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [genderError, setGenderError] = useState("");
    const [statusError, setStatusError] = useState("");

    name = name.split(' ')[0]

    return (
        <div className="flex flex-col gap-2 items-center justify-between min-h-screen w-full">
            <div
                className="fixed inset-0 w-full h-full bg-black"
                style={{
                    backgroundImage: `url('/backgrounds/createTeamBg.png')`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    zIndex: -1
                }}
            />

            <Image
                src='/RCLogo.svg'
                alt="rclogo"
                width={50}
                height={50}
                className="absolute bottom-4 left-8 w-auto h-[10%]"
            />

            <div className="flex justify-between w-full p-2">
                <div />
                <button
                    type="button"
                    onClick={SignOut}
                    className="transition-colors duration-150 motion-preset-blur-down-md
                px-4 py-2 border border-primary text-text w-fit hover:bg-white/20 bg-black/50 backdrop-blur-lg"
                >
                    LOGOUT
                </button>
            </div>

            <div className="relative px-6 py-2 flex justify-center items-center w-[85vw] motion-preset-slide-down-sm">
                <Image
                    src='/frameDecoration.svg'
                    alt="rclogo"
                    width={190}
                    height={100}
                    className="absolute w-auto top-0 left-0 h-[100px] z-50"
                />

                <Image
                    src='/frameDecoration.svg'
                    alt="rclogo"
                    width={190}
                    height={100}
                    className="rotate-180 absolute w-auto -bottom-4 right-0 h-[100px] z-50"
                />

                <div className="w-[65vw] lg:w-full sm:w-[75vw] phone:w-[85vw] phone:mt-[15%]
                      p-16 phone:p-3 mt-5 flex flex-col box-border backdrop-blur-lg bg-black/50 border-4 border-weirdPurple ">
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
                        <div className="w-full mb-3 flex flex-col items-center justify-start gap-4">
                            <div className="flex justify-center items-center gap-2 w-full">
                                <div className="border border-weirdPurple w-1/2 h-3" />
                                <h4 className="font-custom text-weirdPurple md:text-base text-xs">A MESSAGE FROM ACM</h4>
                            </div>
                            <h1 className={`font-custom border-weirdPurple text-center text-transparent text-hollow
                                md:text-[58px] sm:text-3xl xs:text-[135%] phone:text-[135%]`}>
                                HELLO {name}
                            </h1>
                            <div className="flex justify-center items-center gap-2 w-full">
                                <h4 className="font-custom text-weirdPurple md:text-base text-xs">A MESSAGE FROM ACM</h4>
                                <div className="border border-weirdPurple w-1/2 h-3" />
                            </div>
                            <h2 className={` text-weirdPurple font-bold text-center md:text-[120%] xs:text-[100%] phone:text-[90%] mt-2 mb-3`}>
                                Please provide us with the following information to ensure a seamless experience
                            </h2>
                        </div>

                        {/* Form Fields Container */}
                        <div className="w-full max-w-2xl px-4">
                            {/* Phone Number */}
                            <div className="mb-3">
                                <label htmlFor="phone" className={`font-custom font-semibold text-white text-xs block mb-1 `}>
                                    CONTACT NUMBER
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    id="phone"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    className="w-full h-10 p-2 bg-weirdPurple/30 outline-none text-white text-center"
                                    onChange={(e) => {
                                        // Update state only with numbers
                                        const value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
                                        setPhone(value);
                                    }}
                                    value={phone} // Ensure the value is controlled
                                    onInput={() => setPhoneError("")}
                                />
                                <div className="text-red-600 text-xs mt-0.5">
                                    {phoneError}&nbsp;
                                </div>
                            </div>

                            {/* Gender Selection */}
                            <div className="mb-3">
                                <label className={`font-custom font-semibold text-xs text-white block mb-1`}>GENDER</label>
                                <div className="flex flex-col md:flex-row gap-3">
                                    {['male', 'female'].map((gender) => (
                                        <label key={gender} htmlFor={gender} className="flex-1">
                                            <div
                                                className={`transition-colors p-2 w-full text-center text-white font-semibold flex items-center justify-center h-10 cursor-pointer
                                                ${selectedGender === gender
                                                        ? "bg-weirdPurple/70"
                                                        : "bg-weirdPurple/30"}`}
                                                onClick={() => setSelectedGender(gender)}
                                            >
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value={gender}
                                                    id={gender}
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        setGenderError("");
                                                        setSelectedGender(e.target.value);
                                                    }}
                                                />
                                                {gender.toUpperCase()}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <div className="text-red-600 text-xs mt-0.5">{genderError}&nbsp;</div>
                            </div>


                            {/* Status Selection */}
                            <div className="mb-3">
                                <label className={`font-custom font-semibold text-white text-xs block mb-1`}>
                                    SELECT AN OPTION
                                </label>
                                <div className="flex flex-col md:flex-row gap-3">
                                    {['hosteller', 'dayscholar'].map((status) => (
                                        <label key={status} htmlFor={status} className="flex-1">
                                            <div
                                                className={`transition-colors p-2 w-full text-center text-white font-semibold flex items-center justify-center h-10 cursor-pointer
                                                ${selectStatus === status
                                                        ? "bg-weirdPurple/70"
                                                        : "bg-weirdPurple/30"}`}
                                                onClick={() => setSelectStatus(status)} // Ensure state is updated here
                                            >
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value={status}
                                                    id={status}
                                                    className="hidden"
                                                    onChange={() => setSelectStatus(status)} // Additional safeguard
                                                />
                                                {status.toUpperCase()}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <div className="text-red-600 text-xs mt-0.5">{statusError}&nbsp;</div>
                            </div>


                            {/* Submit Button */}
                            <div className="flex justify-center w-full mt-3 mb-4 ">
                                <SubmitButton />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div />
            <div />
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
            className={
                `transition-colors font-bold p-2 w-[45vw] bg-primary text-base md:text-2xl text-white hover:bg-primary/80`
            }
        >
            {pending ? "SUBMITTING..." : "JOIN THE COUNCIL"}
        </button>
    );
}
