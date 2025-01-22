"use client";

import React from "react";
import { AccordionContent, AccordionItem, AccordionTrigger, Accordion } from "../../components/ui/accordion";
import Image from "next/image";
import yellowwhitering from "@/app/assets/yellowwhitering.png";

export default function PortalFaqs() {
    const faqs = [
        {
            id: "faq1",
            question: "What is this portal about?",
            answer: "This portal provides information and resources to help you manage your activities effectively.",
        },
        {
            id: "faq2",
            question: "How can I reset my password?",
            answer: "To reset your password, go to the login page and click on the 'Forgot Password' link. Follow the instructions to reset your password.",
        },
        {
            id: "faq3",
            question: "Who can I contact for support?",
            answer: "For support, you can contact our team via the 'Contact Us' section or email us at support@example.com.",
        },
        {
            id: "faq4",
            question: "How do I access resources?",
            answer: "Resources can be accessed from the main dashboard under the Resources tab.",
        },
        {
            id: "faq5",
            question: "What is the best way to get started?",
            answer: "The best way to get started is by exploring the user guide available in the Help section.",
        },
        {
            id: "faq6",
            question: "Can I update my profile?",
            answer: "Yes, you can update your profile by navigating to the Profile tab and clicking Edit.",
        },
        {
            id: "faq7",
            question: "What are the terms and conditions?",
            answer: "The terms and conditions are available on the bottom of the page in the Terms section.",
        },
    ];

    return (
        <div
            className="min-h-screen relative"
            style={{ backgroundImage: "url('./submissionsbg.png')", backgroundSize: "cover" }}
        >
            <div className="p-6 text-white">
                <h1 className="text-5xl font-bold mb-8">FAQs</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 justify-center">
                    {faqs.map((faq, index) => (
                        <div
                            key={faq.id}
                            className="mb-6 w-[100%] md:w-[80%] mx-auto"
                        >
                            <Accordion type="single" collapsible>
                                <AccordionItem
                                    value={`question${index + 1}`}
                                    className="rounded-lg border border-[rgba(155,81,224,0.5)] bg-[rgba(66,66,66,0.75)] shadow-[0_0_7.7px_4px_#FFF,0_0_18.8px_14px_#7638F5] backdrop-blur-[16px]"
                                >
                                    <AccordionTrigger className="text-lg font-medium p-4">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="p-4 text-sm">
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
