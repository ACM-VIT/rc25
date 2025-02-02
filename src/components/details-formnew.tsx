"use client"
import { useState } from "react"
import onboard from "../app/actions/onboard"
import { useFormStatus } from "react-dom"
import { useSession } from "next-auth/react"
import parsePhoneNumber from "libphonenumber-js"
import Image from "next/image"
import bg from "@/app/assets/detailsbg.svg"
import SignOut from "@/app/(auth)/authactions/signout"
import RC from "../../public/RCLogo.svg"

import { Outfit } from "next/font/google"

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
})

export default function OnboardingForm() {
  const [selectedGender, setSelectedGender] = useState("")
  const { data: session } = useSession()
  const userName = session?.user?.name?.split(" ")[0]
  const [phone, setPhone] = useState("")
  const [selectStatus, setSelectStatus] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [genderError, setGenderError] = useState("")
  const [statusError, setStatusError] = useState("")

  const { pending } = useFormStatus()

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#1a1a2e]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src={bg} alt="Background" fill className="object-cover" priority />
      </div>

      <div className="relative z-30 flex flex-col h-full w-full">
        <div className="flex flex-row w-full h-1/12 justify-end items-center p-4 sm:p-6 md:p-8">
          <button
            type="button"
            className="px-6 py-2 sm:px-8 sm:py-3 w-24 sm:w-28 md:w-32 
                     border bg-[#08000F] border-[#CEB7FF] text-[#CEB7FF] 
                     uppercase hover:bg-[#CEB7FF] hover:text-black 
                     transition-all duration-300 shadow-lg text-sm sm:text-base"
            onClick={async () => {
              await SignOut()
            }}
          >
            Logout
          </button>
        </div>

        <div className="flex flex-col w-full h-10/12 justify-center items-center">
          <div className="w-[80%] lg:w-[70%] text-center relative flex flex-col items-center max-w-lg">
            <div className="flex flex-col box-border bg-[#08000F] bg-opacity-60 border border-[#9B51E0] relative md:mt-[-5%] xl:mt-[-4%] p-[2%]">
              <div className="flex flex-row items-center w-full">
                <div 
                  className="w-2/3 h-[10px] bg-transparent border border-[#CEB7FF]" 
                  style={{
                    boxShadow: "0 0 10px #CEB7FF, 0 0 10px #CEB7FF, 0 0 30px #CEB7FF",
                  }}
                />
                <div className="w-1/3 text-[#CEB7FF] lg:text-center md:text-right md:block hidden text-nowrap md:text-[85%] lg:text-[100%] how-it-works-heading uppercase">
                  A MESSAGE FROM ACM
                </div>
              </div>

              <h1
                className="text-white text-[30px] sm:text-[20px] md:text-[40px] lg:text-[40px] xl:text-[60px]
                          tracking-wide px-6 py-2 how-it-works-heading uppercase"
                style={{
                  color: "transparent",
                  WebkitTextStroke: "2px #CEB7FF",
                  textShadow: "none",
                }}
              >
                HELLO {userName}
              </h1>
              <div className="flex flex-row items-center w-full">
                <div className="w-1/3 text-[#CEB7FF] lg:text-center md:text-left md:block hidden text-nowrap md:text-[85%] lg:text-[100%] how-it-works-heading uppercase">
                  A MESSAGE FROM ACM
                </div>
                <div 
                  className="w-2/3 h-[10px] bg-transparent border border-[#CEB7FF]" 
                  style={{
                    boxShadow: "0 0 10px #CEB7FF, 0 0 10px #CEB7FF, 0 0 30px #CEB7FF",
                  }}
                />
              </div>

              <h2 className="text-[#CEB7FF] text-sm sm:text-base text-center mb-5">
                Please provide us with the following information for a seamless experience
              </h2>

              <form
                action={onboard}
                className="flex flex-col space-y-4"
                onSubmit={(e) => {
                  const parsedPhone = parsePhoneNumber(phone, "IN")
                  if (!parsedPhone || !parsedPhone.isValid()) {
                    e.preventDefault()
                    setPhoneError("Invalid Phone Number")
                  } else {
                    setPhoneError("")
                  }
                  if (selectedGender === "") {
                    e.preventDefault()
                    setGenderError("Please select your Gender")
                  }
                  if (selectStatus === "") {
                    e.preventDefault()
                    setStatusError("Please select an Option")
                  }
                }}
              >
                {/* Phone Number */}
                <label htmlFor="phone" className="text-white text-left text-sm">Contact Number</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  className="w-full p-2 rounded bg-[#CEB7FF] bg-opacity-20 border border-[#F0F1FA] text-white focus:ring focus:ring-[#9B51E0]"
                  placeholder="Enter your phone number"
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                  value={phone}
                />
                <div className="text-red-600 text-xs">{phoneError}</div>

                {/* Gender Selection */}
                <label htmlFor="gender-group" className="text-white text-left text-sm">Gender</label>
                <fieldset id="gender-group" aria-label="Gender Selection" className="flex gap-4 border-0">
                  {["male", "female"].map((gender) => (
                    <label key={gender} className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        className="hidden"
                        checked={selectedGender === gender}
                        onChange={() => setSelectedGender(gender)}
                      />
                      <div
                        className={`p-3 text-center border border-[#F0F1FA] text-lg font-semibold
                                    ${selectedGender === gender ? "bg-[#CEB7FF] bg-opacity-9 text-black" : "bg-[#CEB7FF] bg-opacity-20 text-white"}`}
                      >
                        {gender.toUpperCase()}
                      </div>
                    </label>
                  ))}
                </fieldset>
                <div className="text-red-600 text-xs">{genderError}</div>

                {/* Status Selection */}
                <label htmlFor="status-group" className="text-white text-left text-sm">Select an Option</label>
                <div id="status-group" className="flex gap-4">
                  {["HOSTELLER", "DAY SCHOLAR"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`flex-1 p-3 text-center border border-[#F0F1FA] text-lg font-semibold
                                 ${selectStatus === status ? "bg-[#CEB7FF] bg-opacity-9.5 text-black" : "bg-[#CEB7FF] bg-opacity-20 text-white"}`}
                      onClick={() => setSelectStatus(status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <div className="text-red-600 text-xs">{statusError}</div>

                {/* Submit Button */}
                <div className="flex justify-center w-full mt-5 mb-5">
                  <button 
                    type="submit"
                    className={`px-8 py-3 bg-[#9B51E0] text-white text-xl hover:bg-[#a765e0] ${outfit.className}`} 
                    style={{
                      color: 'transparent',
                      WebkitTextStroke: '1px white',
                      textShadow: 'none'
                    }}
                    disabled={pending}
                  >
                    {pending ? "JOINING..." : "JOIN THE COUNCIL"}
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
            width={120}
            height={120}
            className="transform scale-100"
            priority
          />
        </div>
      </div>
    </div>
  )
}
