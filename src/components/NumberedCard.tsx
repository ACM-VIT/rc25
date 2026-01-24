"use client"

import { ChevronDown } from "lucide-react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { formula1Bold } from "@/lib/fonts";

interface NumberedCardProps {
    title: string;
    index: number;
    description?: string;
}

export default function NumberedCard({ title, index, description }: NumberedCardProps) {
    // Unique ID prefix for this card instance
    const uniqueId = `card-${index}`;

    // If no description, render without accordion
    if (!description) {
        return (
            <div className="relative w-full min-h-[80px] sm:min-h-[90px] md:min-h-[100px] lg:min-h-[104px]">
                <CardHeader uniqueId={uniqueId} index={index} title={title} />
            </div>
        );
    }

    return (
        <AccordionPrimitive.Root type="single" collapsible className="w-full">
            <AccordionPrimitive.Item value={`item-${index}`} className="border-none relative">
                <AccordionPrimitive.Trigger className="w-full group">
                    <div className="relative w-full min-h-[80px] sm:min-h-[90px] md:min-h-[100px] lg:min-h-[104px] cursor-pointer">
                        <CardHeader uniqueId={uniqueId} index={index} title={title} hasDescription />
                    </div>
                </AccordionPrimitive.Trigger>
                <AccordionPrimitive.Content className="w-full overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down flex justify-end">
                    <div 
                        className="w-[98.5%] min-h-[120px] sm:min-h-[150px] md:min-h-[180px] lg:min-h-[214px] relative"
                        style={{
                            background: "linear-gradient(180deg, #A7282D 0%, #411012 100%)",
                            borderLeft: "1px solid #611015",
                            borderRight: "1px solid #611015",
                            borderBottom: "1px solid #611015",
                        }}
                    >
                        {/* Description content */}
                        <div className="relative z-10 p-4 sm:p-5 md:p-6 lg:p-8">
                            <p
                                className={`${formula1Bold.className} text-white whitespace-pre-line`}
                                style={{
                                    fontSize: "clamp(0.75rem, 1vw + 0.25rem, 1.125rem)",
                                    lineHeight: "1.6",
                                }}
                            >
                                {description}
                            </p>
                        </div>
                    </div>
                </AccordionPrimitive.Content>
            </AccordionPrimitive.Item>
        </AccordionPrimitive.Root>
    );
}

// Extracted header component for reuse
function CardHeader({ uniqueId, index, title, hasDescription = false }: {
    uniqueId: string;
    index: number;
    title: string;
    hasDescription?: boolean;
}) {
    return (
        <>
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 1344 104"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full"
            >
                {/* Grey background rectangle */}
                <rect
                    x="-0.436202"
                    y="0.436202"
                    width="1321.13"
                    height="96.1276"
                    transform="matrix(-1 0 0 1 1343.13 0)"
                    fill={`url(#${uniqueId}-paint0)`}
                />
                <rect
                    x="-0.436202"
                    y="0.436202"
                    width="1321.13"
                    height="96.1276"
                    transform="matrix(-1 0 0 1 1343.13 0)"
                    stroke="black"
                    strokeWidth="0.872405"
                />
                {/* Red trapezoid shape */}
                <g filter={`url(#${uniqueId}-filter0)`}>
                    <path d="M22 1H258L178.5 97H22V1Z" fill={`url(#${uniqueId}-paint1)`}/>
                </g>
                {/* Smaller dark red parallelogram */}
                <g filter={`url(#${uniqueId}-filter1)`}>
                    <path d="M25.9737 50H199.927L169.22 84.0586H0L25.9737 50Z" fill="#9D171C"/>
                </g>
                <defs>
                    <filter id={`${uniqueId}-filter0`} x="22" y="1" width="251.7" height="102.979" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dx="12.21" dy="3.48962"/>
                        <feGaussianBlur stdDeviation="1.74481"/>
                        <feComposite in2="hardAlpha" operator="out"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
                    </filter>
                    <filter id={`${uniqueId}-filter1`} x="0" y="50" width="205.443" height="39.5738" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dx="2.75762" dy="2.75762"/>
                        <feGaussianBlur stdDeviation="1.37881"/>
                        <feComposite in2="hardAlpha" operator="out"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
                    </filter>
                    <linearGradient id={`${uniqueId}-paint0`} x1="1322" y1="48.5002" x2="0" y2="48.5002" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#3F3E3E"/>
                        <stop offset="1" stopColor="#252525"/>
                    </linearGradient>
                    <linearGradient id={`${uniqueId}-paint1`} x1="140" y1="1" x2="140" y2="97" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#A7282D"/>
                        <stop offset="1" stopColor="#411012"/>
                    </linearGradient>
                </defs>
            </svg>

            {/* Content layer on top of SVG */}
            <div className="relative z-10 flex items-center min-h-[80px] sm:min-h-[90px] md:min-h-[100px] lg:min-h-[104px] py-2 sm:py-3 md:py-4">
                {/* Number in the smaller red parallelogram */}
                <span
                    className={`${formula1Bold.className} absolute text-white`}
                    style={{
                        bottom: "22%",
                        left: "6%",
                        fontSize: "clamp(0.875rem, 1vw + 0.5rem, 1.3rem)"
                    }}
                >
                    {index.toString().padStart(2, "0")}
                </span>

                {/* Title text in the grey area */}
                <span
                    className={`${formula1Bold.className} text-white text-left`}
                    style={{
                        marginBottom: "1%",
                        marginLeft: "20%",
                        marginRight: "2%",
                        fontSize: "clamp(1rem, 1.5vw + 0.5rem, 1.875rem)",
                        lineHeight: "1.4",
                    }}
                >
                    {title}
                </span>

                {/* Chevron indicator */}
                {hasDescription && (
                    <ChevronDown
                        className="absolute right-4 sm:right-6 md:right-8 text-white h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200 group-data-[state=open]:rotate-180"
                    />
                )}
            </div>
        </>
    );
}