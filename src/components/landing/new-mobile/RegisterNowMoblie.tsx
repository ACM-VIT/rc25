import type React from "react";
import Image from "next/image";

const RegisterNowMobile: React.FC = () => {
    return (
        <>
            <div className="absolute inset-0 z-20"></div>
            <div className="absolute bottom-0 z-10 w-full flex flex-row justify-between">
                <div className="relative w-20 h-20 translate-y-1">
                    <Image
                        alt="ACM logo"
                        src="https://rc25-assets.acmvit.in/ACMlLogo2.png"
                        fill
                        className="object-contain scale-50"
                        priority
                    />
                </div>
                <div className="relative w-20 h-20  ">
                    <Image
                        alt="RC logo"
                        src="https://rc25-assets.acmvit.in/RClogo2.png"
                        fill
                        className="object-contain scale-50"
                        priority
                    />
                </div>
            </div>

            <div className="absolute inset-0 z-50 w-full h-full flex flex-col content-center">
                <button
                    className="how-it-works-heading text-white content-center text-center h-full  text-7xl lg:text-[80px] xl:text-[115px]"
                    onClick={SignIn}
                >
                    <h1>
                        REGISTER <br />
                        NOW
                    </h1>
                </button>
            </div>

            <div className="relative w-screen h-screen overflow-hidden">
                <div className="absolute inset-0 z-10">
                    <Image
                        src="https://rc25-assets.acmvit.in/RegisterNowMobile.png"
                        alt="bg"
                        layout="fill"
                        objectFit="cover"
                        className="z-0"
                    />
                </div>

                <div className="absolute z-40 flex flex-col h-full w-full">
                    <div className="how-it-works-heading text-white content-center text-center h-3/4 w-full text-7xl lg:text-[80px] xl:text-[115px]"></div>
                    <div className="how-it-works-heading text-white content-center text-center h-2/4 w-full text-3xl lg:text-[80px] xl:text-[115px]">
                        <p>Reach us at</p>
                        <div className="flex flex-row justify-center content-center m-8 items-start gap-6">
                            {[
                                { src: "https://rc25-assets.acmvit.in/Vector(1).svg", href: "https://github.com/ACM-VIT" },
                                {
                                    src: "https://rc25-assets.acmvit.in/Vector.svg",
                                    href: "https://www.instagram.com/acmvit/",
                                },
                                {
                                    src: "https://rc25-assets.acmvit.in/Vector(3).svg",
                                    href: "https://www.linkedin.com/company/acmvit/",
                                },
                                {
                                    src: "https://rc25-assets.acmvit.in/Vector(2).svg",
                                    href: "https://www.facebook.com/acmvitvellore/",
                                },
                                { src:"https://rc25-assets.acmvit.in/Vector(4).svg", href: "https://x.com/ACM_VIT" },
                                { src: "https://rc25-assets.acmvit.in/Vector(5).svg", href: "https://blog.acmvit.in/" },
                            ].map((item, index) => (
                                <a
                                    key={`vector-${index}`}
                                    href={item.href}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Image
                                        alt={`Vector icon ${index + 1}`}
                                        src={item.src}
                                        width={48}
                                        height={48}
                                        className=" scale-120 transform fix"
                                        priority
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RegisterNowMobile;
