"use client";
import React from "react";
import onboard from "../app/actions/onboard";
import { useFormStatus } from "react-dom";
import parsePhoneNumber from "libphonenumber-js";
import { useState } from "react";

import Image from 'next/image'
import logo from "@/app/assets/RCLogo.svg"

export default function OnboardingForm() {
    const [selectedGender, setSelectedGender] = useState("");
    const [phone, setPhone] = useState("");
    const [selectStatus, setSelectStatus] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [genderError, setGenderError] = useState("");
    const [statusError, setStatusError] = useState("");

    return (
        <div className="flex items-center justify-center min-h-screen w-full bg-transparent">

            <Image
                src={logo}
                alt="rclogo"
                className="absolute top-4 left-8 w-auto h-[8%]" 
            />

            <div className="w-[65vw] md:w-[55vw] lg:w-[50vw] sm:w-[75vw] phone:w-[85vw] phone:mt-[15%]
                      p-4 phone:p-3 mt-5
                      flex flex-col box-border rounded-[5%] 
                      backdrop-blur-md bg-transparent border border-[#9B51E0] ">
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
                    {/* Header */}
                    <div className="w-full mb-3">
                    <h1 className="font-bold text-center text-white md:text-[200%] sm:text-3xl xs:text-[135%] phone:text-[135%] font-title mb-2">
    HELLO THERE!
</h1>
                        <h2 className=" font-subtitle text-white text-center md:text-[120%] xs:text-[100%] phone:text-[90%] mt-2 mb-3  ">
                            To ensure a seamless experience, please tell us more about yourself
                        </h2>
                    </div>

                    {/* Form Fields Container */}
                    <div className="w-full max-w-2xl px-4">
                        {/* Phone Number */}
                        <div className="mb-3">
    <label htmlFor="phone" className="font-subtitle font-semibold text-white text-xs block mb-1">
        PHONE NUMBER
    </label>
    <input
        type="tel"
        name="phone"
        id="phone"
        inputMode="numeric"
        pattern="[0-9]*"
        className="w-full h-10 rounded-md p-2 bg-transparent
                   box-border border-dashed border-[#F0F1FA] border-2 
                   outline-none text-white"
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
                            <label className="font-subtitle font-semibold text-xs text-white block mb-1">GENDER</label>
                            <div className="flex flex-col md:flex-row gap-3">
                                {['male', 'female'].map((gender) => (
                                    <label key={gender} htmlFor={gender} className="flex-1">
                                        <div
                                            className={`p-2 w-full text-center box-border border-dashed 
                    border-2 border-[#F0F1FA] font-subtitle font-semibold rounded-md 
                    flex items-center justify-center h-10 cursor-pointer
                    ${selectedGender === gender
                                                ? "bg-[#f0f1fade] text-purple-700"
                                                : "bg-transparent text-white"}`}
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
                            <label className="font-subtitle font-semibold text-white text-xs block mb-1">
                                PLEASE SELECT AN OPTION
                            </label>
                            <div className="flex flex-col md:flex-row gap-3">
                                {['hosteller', 'dayscholar'].map((status) => (
                                    <label key={status} htmlFor={status} className="flex-1">
                                        <div
                                            className={`p-2 w-full text-center box-border border-dashed 
                    border-2 border-[#F0F1FA] font-subtitle font-semibold rounded-md 
                    flex items-center justify-center h-10 cursor-pointer
                    ${selectStatus === status
                                                ? "bg-[#f0f1fade] text-purple-700"
                                                : "bg-transparent text-white"}`}
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
                            <SubmitButton/>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SubmitButton() {
    const {pending} = useFormStatus();

    return (
        <button
            type="submit"
            id="submit_button"
            aria-disabled={pending}
            disabled={pending}
            className={
                "p-2 w-[45vw] bg-[#f0f1fade] text-[120%] md:text-[180%] font-title text-purple-700 rounded-md hover:bg-gray-500"
            }
        >
            {pending ? "SUBMITTING..." : "ENTER"}
        </button>
    );
}