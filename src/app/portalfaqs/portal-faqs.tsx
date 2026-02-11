"use client";

import React from "react";
import NumberedCard from "@/components/NumberedCard";
import { formula1Wide } from "@/lib/fonts";

export default function PortalFaqs() {
    const faqs = [
        {
            id: "faq1",
            question: "HOW MANY MEMBERS ARE ALLOWED IN A TEAM?",
            answer: "Each team can have 1 to 4 members.",
        },
        {
            id: "faq2",
            question: "IS THERE A REGISTRATION FEE?",
            answer: "No, the event is completely free of cost.",
        },
        {
            id: "faq3",
            question: "CAN I USE ONLINE RESOURCES DURING THE CONTEST?",
            answer: "Participants may use online resources like documentation and tutorials, but collaborating with others outside their team or sharing solutions with other teams during the contest is strictly prohibited.",
        },
        {
            id: "faq4",
            question: "WHAT SHOULD I DO IF I CAN’T FIND TEAMMATES?",
            answer: "If you can’t find teammates, you can still participate solo - the team size allows 1-4 members. You can also join the Discord server to find and team up with other participants.",
        },
        {
            id: "faq5",
            question: "WILL OD BE PROVIDED?",
            answer: "Yes, On-Duty (OD) will be provided to participants who have registered on VTOP.",
        },
        {
            id: "faq6",
            question: "IS THIS EVENT BEGINNER-FRIENDLY?",
            answer: "Yes, the event is beginner-friendly, with problems designed for all skill levels and a focus on logical thinking and learning.",
        },
        {
            id: "faq7",
            question: "WHAT PROGRAMMING LANGUAGES ARE ALLOWED?",
            answer: "You may use C, C++, Java, Python, JavaScript, Go, Rust programming language to submit your solutions.",
        },
        {
            id: "faq8",
            question: "WHICH TEAMS QUALIFY FOR ROUND 2?",
            answer: "The top-performing teams on the leaderboard will qualify for the second round.",
        },
        {
            id: "faq9",
            question: "HOW DO I WIN REVERSE CODING?",
            answer: "Winning is determined by the accuracy and speed of the solutions submitted by the participants. The final leaderboard, based on overall performance throughout the event, will decide the winners.",
        },
    ];

    return (
        <div
            className="min-h-screen relative flex flex-col items-center justify-start p-2 sm:p-3 md:p-4 lg:p-6 pt-12 sm:pt-16 md:pt-20 lg:pt-24"
            style={{
                backgroundImage: "url('/Dashboard.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
            }}
        >
            <h1 className={`${formula1Wide.className} text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8 md:mb-10 lg:mb-12 mt-2 sm:mt-4 md:mt-6 lg:mt-8 underline`}>
                FAQs
            </h1>

            <div className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[80%] mx-auto flex flex-col gap-2 sm:gap-3 md:gap-4 lg:gap-5">
                {faqs.map((faq, index) => (
                    <NumberedCard key={faq.id} title={faq.question} description={faq.answer} index={index + 1} />
                ))}
            </div>
        </div>
    );
}