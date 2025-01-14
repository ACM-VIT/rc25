"use client";

import React from "react";
import Navbar from "../../components/Navbar";
import { AccordionContent, AccordionItem, AccordionTrigger, Accordion } from "../../components/ui/accordion";
import Image from "next/image";
import yellowwhitering from "@/app/assets/yellowwhitering.png";

export default function PortalFaqs() {
    const faqs = [
        {
            question: "What is this portal about?",
            answer: "This portal provides information and resources to help you manage your activities effectively.",
        },
        {
            question: "How can I reset my password?",
            answer: "To reset your password, go to the login page and click on the 'Forgot Password' link. Follow the instructions to reset your password.",
        },
        {
            question: "Who can I contact for support?",
            answer: "For support, you can contact our team via the 'Contact Us' section or email us at support@example.com.",
        },
        {
            question: "How do I access resources?",
            answer: "Resources can be accessed from the main dashboard under the Resources tab.",
        },
        {
            question: "What is the best way to get started?",
            answer: "The best way to get started is by exploring the user guide available in the Help section.",
        },
        {
            question: "Can I update my profile?",
            answer: "Yes, you can update your profile by navigating to the Profile tab and clicking Edit.",
        },
        {
            question: "What are the terms and conditions?",
            answer: "The terms and conditions are available on the bottom of the page in the Terms section.",
        },
    ];

    return (
        <div className="bg-[radial-gradient(110.8%_70.71%_at_50%_50%,_#0B0014_55.41%,_#18181B_100%)] min-h-screen relative">
            <Navbar name="John Doe" />
            <div className="p-6 text-white">
                <h1 className="text-5xl font-bold mb-8">FAQs</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-[#33273e] bg-opacity-70 rounded-lg mb-4 w-[100%] md:w-[80%] mx-auto"
                        >
                            <Accordion type="single" collapsible>
                                <AccordionItem
                                    value={`question${index + 1}`}
                                    className="rounded-lg border-none outline-none" // Ensured no borders or outlines
                                >
                                    <AccordionTrigger className="text-lg font-medium p-4 border-none outline-none">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="p-4 text-sm border-none outline-none">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                        </div>
                    ))}
                </div>
            </div>
            <Image
                src={yellowwhitering}
                alt="Yellow White Ring"
                className="absolute bottom-0 right-0 md:w-48 md:h-40"
            />
        </div>
    );
}
