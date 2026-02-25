"use client";
import React, { useState } from "react";
import onboard from "@/app/actions/onboard";
import { useFormStatus } from "react-dom";
import parsePhoneNumber from "libphonenumber-js";
import { useSession } from "next-auth/react";
import SignOut from "@/app/(auth)/authactions/signout";
import Header from "./Header";
import DetailsField from "./details-field";
import { formula1Bold } from "@/lib/fonts";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      id="submit_button"
      aria-disabled={pending}
      disabled={pending}
      className={`${formula1Bold.className} mx-auto mt-4 flex h-[44px] w-full max-w-[357px] items-center justify-center rounded-[10px] border-[3px] border-[#a7282d] bg-[linear-gradient(180.008deg,rgba(0,0,0,0.93)_0%,rgba(42,42,42,0.93)_176.23%)] text-center text-[14px] uppercase leading-[1.5] text-white shadow-[0px_0px_26.989px_0px_#9f242d,0px_0px_15.422px_0px_#9f242d,0px_0px_8.996px_0px_#9f242d,0px_0px_4.498px_0px_#9f242d,0px_0px_1.285px_0px_#9f242d,0px_0px_0.643px_0px_#9f242d] transition-[filter,opacity,transform] duration-200 hover:brightness-110 active:brightness-125 disabled:opacity-60 sm:mt-6 sm:h-[56px] sm:text-[18px] md:h-[76px] md:border-[6px] md:text-[28px]`}
    >
      {pending ? "SUBMITTING..." : "JOIN THE RACE"}
    </button>
  );
}

export default function OnboardingForm() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] ?? "User";
  const [selectedGender, setSelectedGender] = useState("");
  const [phone, setPhone] = useState("");
  const [selectStatus, setSelectStatus] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [statusError, setStatusError] = useState("");
  const phoneProgress = Math.min(phone.length / 10, 1);

  const handleGenderSelect = (value: string) => {
    setSelectedGender(value);
    if (genderError) setGenderError("");
  };

  const handleStatusSelect = (value: string) => {
    setSelectStatus(value);
    if (statusError) setStatusError("");
  };

  return (
    <main
      className="relative h-screen w-full overflow-y-auto bg-[#0c0c0c]"
    >
      <img
        src="/ParticipantDetails/details-road-bg.svg"
        alt=""
        aria-hidden="true"
        className="-translate-x-1/2 pointer-events-none absolute bottom-0 left-1/2 h-[416px] w-[1847px] max-w-none"
      />

      <div className="relative z-10 flex min-h-full w-full flex-col items-center">
        <Header title={`Hello ${userName}`} />

        <p
          className={`${formula1Bold.className} mt-2 w-full max-w-[1500px] px-6 text-center text-[10px] leading-[1.5] text-white sm:mt-4 sm:text-[14px] md:mt-6 md:text-[20px]`}
        >
          Please provide us with the following information to ensure your seamless experience
        </p>

        <form
          action={onboard}
          className="mt-4 w-full max-w-[608px] px-6 sm:mt-6 md:mt-10"
          onSubmit={(e) => {
            const trimmedPhone = phone.trim();
            if (trimmedPhone.length !== 10) {
              e.preventDefault();
              setPhoneError("Not the correct length");
            } else {
              const parsedPhone = parsePhoneNumber(trimmedPhone, "IN");
              if (!parsedPhone || !parsedPhone.isValid()) {
                e.preventDefault();
                setPhoneError("Invalid Phone Number");
              } else {
                setPhoneError("");
              }
            }

            if (selectedGender === "") {
              e.preventDefault();
              setGenderError("Please select your Gender");
            } else {
              setGenderError("");
            }

            if (selectStatus === "") {
              e.preventDefault();
              setStatusError("Please select an Option");
            } else {
              setStatusError("");
            }
          }}
        >
          {/* Hidden inputs for form submission */}
          <input type="hidden" name="phone" value={phone} />
          <input type="hidden" name="gender" value={selectedGender} />
          <input type="hidden" name="status" value={selectStatus} />

          <div className="flex flex-col gap-4 sm:gap-6 md:gap-10">
            {/* Phone Number */}
            <div>
              <label
                htmlFor="onboarding_phone"
                className={`${formula1Bold.className} mb-2 block text-center text-[12px] leading-[1.5] text-white sm:mb-3 sm:text-[16px] md:mb-4 md:text-[20px]`}
              >
                Contact Number
              </label>
              <div className="w-full">
                <div className="relative w-full bg-[#080a0d] md:h-[117.566px]">
                  <div className="flex items-center gap-3 px-4 pb-4 pt-6 sm:gap-4 sm:px-6 sm:pb-6 sm:pt-10 md:pb-7 md:pt-11">
                  <img
                    src="/ParticipantDetails/InputIcon.svg"
                    alt=""
                    aria-hidden="true"
                    className="h-6 w-6 shrink-0 md:h-8 md:w-8"
                  />
                  <input
                    id="onboarding_phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="9606333XXX"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      setPhoneError("");
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                    }}
                    className={`${formula1Bold.className} w-full bg-transparent text-[14px] leading-[normal] text-white outline-none placeholder:text-white/35 sm:text-[22px] md:text-[27px]`}
                  />
                  </div>
                  <div className="absolute left-0 right-0 bottom-[14px] h-[2px] bg-[#a7282d]" />
                </div>
              <div className="relative h-[8px] w-full overflow-hidden bg-[#222221] sm:h-[12.435px]">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 origin-left bg-[#a7282d] transition-transform duration-300 ease-out"
                  style={{ transform: `scaleX(${phoneProgress})` }}
                />
              </div>
              </div>
              <p
                className={`${formula1Bold.className} mt-2 text-[12px] leading-[1.5] text-[#a7282d] md:text-[16px]`}
              >
                {phoneError}
              </p>
            </div>

            {/* Gender Selection */}
            <div>
              <DetailsField
                fieldType="Gender"
                value1="MALE"
                value2="FEMALE"
                selected={selectedGender}
                onSelect={handleGenderSelect}
              />
              <p
                className={`${formula1Bold.className} mt-2 text-[12px] leading-[1.5] text-[#a7282d] md:text-[16px]`}
              >
                {genderError}
              </p>
            </div>

            {/* Accommodation/Status Selection */}
            <div>
              <DetailsField
                fieldType="Select an option"
                value1="HOSTELLER"
                value2="DAYSCHOLAR"
                selected={selectStatus}
                onSelect={handleStatusSelect}
              />
              <p
                className={`${formula1Bold.className} mt-2 text-[12px] leading-[1.5] text-[#a7282d] md:text-[16px]`}
              >
                {statusError}
              </p>
            </div>
          </div>

          <div className="pb-6 sm:pb-10 md:pb-20">
            <SubmitButton />
          </div>
        </form>

        <div className="pointer-events-auto absolute bottom-6 right-6 hidden md:block">
          <button
            type="button"
            onClick={() => SignOut()}
            className="h-[39px] w-[160px] rounded-[8px] bg-[#a7282d] text-center text-[20px] font-bold leading-[normal] text-white transition-colors duration-200 hover:bg-[#8a2024] active:opacity-80"
          >
            Log Out
          </button>
        </div>

        <div className="pointer-events-auto mt-4 flex w-full max-w-[608px] justify-end px-6 pb-8 md:hidden">
          <button
            type="button"
            onClick={() => SignOut()}
            className="h-[36px] rounded-[8px] bg-[#a7282d] px-5 text-center text-[14px] font-bold leading-[normal] text-white transition-colors duration-200 hover:bg-[#8a2024] active:opacity-80"
          >
            Log Out
          </button>
        </div>
      </div>
    </main>
  );
}
