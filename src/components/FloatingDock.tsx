import Image from "next/legacy/image";
import Link from "next/link";

function FloatingDockItems({ href, src, className, tooltip }: { href: string, src: string, className?: string, tooltip: string }) {
    return (
        <div className="relative flex justify-center items-center group">
            <Link
                href={href}
                className={`bg-weirdPurple/40 p-2 rounded-full transition-transform duration-300 ease-in-out 
                hover:scale-125 hover:-translate-y-1 hover:text-accent ${className}`}
            >
                <Image
                    src={src}
                    alt={href}
                    width={30}
                    height={30}
                    className="transition-transform duration-50 ease-in-out"
                />
            </Link>
            {/* Tooltip */}
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white 
                bg-black/80 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                {tooltip}
            </div>
        </div>
    );
}

export default function FloatingDock() {
    return (
        <div className="bg-secondary/60 text-text flex shadow-lg justify-between backdrop-blur-3xl
            w-[280px] px-6 py-2 rounded-xl fixed bottom-2 left-1/2 transform -translate-x-1/2
            z-50 shadow-black/20 hover:shadow-xl hover:-translate-y-2 hover:w-[320px]
            hover:scale-105 transition-all duration-200 ease-in-out gap-x-4">
            <FloatingDockItems
                href="/"
                tooltip="Home"
                className="motion-preset-slide-up-md motion-delay-[300ms]"
                src="/floatingDock/death-star.svg"
            />
            <FloatingDockItems
                tooltip="Submissions"
                href="/submissions"
                className="motion-preset-slide-up-md motion-delay-[400ms]"
                src="/floatingDock/jedi-insignia.svg"
            />
            <FloatingDockItems
                tooltip="Instructions"
                href="/instructions"
                className="motion-preset-slide-up-md motion-delay-[500ms]"
                src="/floatingDock/falcon.svg"
            />
            <FloatingDockItems
                href="/portalfaqs"
                tooltip="FAQ's"
                className="motion-preset-slide-up-md motion-delay-[600ms]"
                src="/floatingDock/sith-insignia.svg"
            />
            <FloatingDockItems
                href="/profile"
                tooltip="Profile"
                className="motion-preset-slide-up-md motion-delay-[700ms]"
                src="/floatingDock/vader.svg"
            />
        </div>
    );
}
