"use client";

import React from "react";
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Accordion,
} from "../../components/ui/accordion";
// import Image from "next/image";
// import yellowwhitering from "@/app/assets/yellowwhitering.png";

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
            className="flex min-h-dvh w-full justify-center"
            style={{
                backgroundImage: "url('./submissionsbg.png')",
                backgroundSize: "contain",
                backgroundAttachment: "fixed",
            }}
        >
            <div className="p-6 text-white w-[80%]">
                <p className="text-5xl font-semibold text-center border-white pt-0 pb-10">
                    FAQs
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7 justify-center">
                    {faqs.map((faq, index) => (
                        <div
                            key={faq.id}
                            className="mb-6 items-baseline w-full md:w-[80%] mx-auto"
                        >
                            <Accordion type="single" collapsible>
                                <AccordionItem
                                    value={`question${index + 1}`}
                                    className="rounded-lg border border-[rgba(155,81,224,0.5)] bg-[rgba(66,66,66,0.75)] shadow-[0_0_9.7px_1px_#FFF,0_0_18.8px_10px_#7638F5] backdrop-blur-lg"
                                >
                                    <AccordionTrigger className="md:text-lg font-medium p-4">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="p-4 pt-0 text-sm">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
