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
            answer:
                "This portal allows you to revisit past Reverse Coding competition questions and view detailed solutions. It’s designed as a resource for continuous learning and practice.",
        },
        {
            id: "faq2",
            question: "HOW DO I ACCESS RESOURCES?",
            answer:
                "Resources, including questions and detailed solutions, can be accessed from the main dashboard. Simply navigate through the portal to explore the available content.",
        },
        {
            id: "faq3",
            question: "WHAT IS THE BEST WAY TO GET STARTED?",
            answer:
                "The best way to get started is by exploring the questions available in the portal and trying out the interactive editor. Detailed solutions are provided for you to learn different approaches.",
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
                            className="mb-6 items-baseline w-[100%] md:w-[80%] mx-auto"
                        >
                            <Accordion type="single" collapsible>
                                <AccordionItem
                                    value={`question${index + 1}`}
                                    className="rounded-lg border border-[rgba(155,81,224,0.5)] bg-[rgba(66,66,66,0.75)] shadow-[0_0_9.7px_1px_#FFF,0_0_18.8px_10px_#7638F5] backdrop-blur-[16px]"
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