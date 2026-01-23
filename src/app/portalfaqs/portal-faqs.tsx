"use client";

import React from "react";
import NumberedCard from "@/components/NumberedCard";
import { formula1Wide } from "@/lib/fonts";

export default function PortalFaqs() {
    const faqs = [
        {
            id: "faq1",
            question: "WHAT IS THIS PORTAL ABOUT?",
            answer: "This portal provides information and resources to help you manage your activities effectively.",
        },
        { 
            id: "faq2",
            question: "HOW CAN I RESET MY PASSWORD?",
            answer: "To reset your password, go to the login page and click on the 'Forgot Password' link. Follow the instructions to reset your password.",
        },
        {
            id: "faq3",
            question: "WHO CAN I CONTACT FOR SUPPORT?",
            answer: "For support, you can contact our team via the 'Contact Us' section or email us at support@example.com.",
        },
        {
            id: "faq4",
            question: "HOW DO I ACCESS RESOURCES?",
            answer: "Resources can be accessed from the main dashboard under the Resources tab.",
        },
        {
            id: "faq5",
            question: "WHAT IS THE BEST WAY TO GET STARTED?",
            answer: "The best way to get started is by exploring the user guide available in the Help section.",
        },
        {
            id: "faq6",
            question: "CAN I UPDATE MY PROFILE?",
            answer: "Yes, you can update your profile by navigating to the Profile tab and clicking Edit.",
        },
        {
            id: "faq7",
            question: "WHAT ARE THE TERMS AND CONDITIONS?",
            answer: "The terms and conditions are available on the bottom of the page in the Terms section.",
        },
    ];

    return (
        <div
            className="min-h-screen relative flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8"
            style={{
                backgroundImage: "url('/Dashboard.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <h1 className={`${formula1Wide.className} text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 sm:mb-12 md:mb-16 lg:mb-20 mt-4 sm:mt-6 md:mt-8 lg:mt-10 underline`}>
                FAQs
            </h1>

            <div className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[80%] mx-auto flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {faqs.map((faq, index) => (
                    <NumberedCard key={faq.id} title={faq.question} index={index + 1} />
                ))}
            </div>
        </div>
    );
}
