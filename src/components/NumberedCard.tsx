"use client"

import { formula1Bold } from "@/lib/fonts";

interface NumberedCardProps {
    title: string;
    index: number;
}

export default function NumberedCard({ title, index }: NumberedCardProps) {
    return (
        <div className="relative w-full min-h-[104px]">
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
                    fill="url(#paint0_linear_1316_1762)"
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
                <g filter="url(#filter0_d_1316_1762)">
                    <path d="M22 1H258L178.5 97H22V1Z" fill="url(#paint1_linear_1316_1762)"/>
                </g>
                {/* Smaller dark red parallelogram */}
                <g filter="url(#filter1_d_1316_1762)">
                    <path d="M25.9737 50H199.927L169.22 84.0586H0L25.9737 50Z" fill="#9D171C"/>
                </g>
                <defs>
                    <filter id="filter0_d_1316_1762" x="22" y="1" width="251.7" height="102.979" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dx="12.21" dy="3.48962"/>
                        <feGaussianBlur stdDeviation="1.74481"/>
                        <feComposite in2="hardAlpha" operator="out"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1316_1762"/>
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1316_1762" result="shape"/>
                    </filter>
                    <filter id="filter1_d_1316_1762" x="0" y="50" width="205.443" height="39.5738" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dx="2.75762" dy="2.75762"/>
                        <feGaussianBlur stdDeviation="1.37881"/>
                        <feComposite in2="hardAlpha" operator="out"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1316_1762"/>
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1316_1762" result="shape"/>
                    </filter>
                    <linearGradient id="paint0_linear_1316_1762" x1="1322" y1="48.5002" x2="0" y2="48.5002" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#3F3E3E"/>
                        <stop offset="1" stopColor="#252525"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear_1316_1762" x1="140" y1="1" x2="140" y2="97" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#A7282D"/>
                        <stop offset="1" stopColor="#411012"/>
                    </linearGradient>
                </defs>
            </svg>
            
            {/* Content layer on top of SVG */}
            <div className="relative z-10 flex items-center min-h-[104px] py-4">
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
                    className={`${formula1Bold.className} text-white`}
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
            </div>
        </div>
    );
}
