import Image from "next/image";
import Link from "next/link";

function FloatingDockItems({ href, src, className }: { href: string, src: string, className?: string }) {
    return (
        <Link href={href} className={`bg-weirdPurple/40 p-2 rounded-full hover:scale-[200%] hover:-translate-y-1 hover:text-accent duration-100 transition-all ${className}`}>
            <Image
                src={src}
                alt={href}
                width={30}
                height={30}
                className=""
            />
        </Link>
    );
}

export default function FloatingDock() {
    return (
        <div className="bg-[#262626]/25 text-text flex shadow-2xl shadow-weirdPurple justify-between backdrop-blur-md 
            w-[250px] px-4 py-2 rounded-xl  transition-all
            fixed bottom-2 left-1/2 transform -translate-x-1/2  hover:p4 hover:shadow-2xl hover:shadow-weirdPurple/20 
            hover:-translate-y-2 hover:w-[300px] hover:scale-110
            hover:motion-translate-y-loop-[5%] motion-ease-in-out motion-duration-2000 motion-preset-slide-up-md z-50">
            <FloatingDockItems
                href="/"
                className="motion-preset-slide-up-md motion-delay-[300ms]"
                src="/floatingDock/death-star.svg"
            />
            <FloatingDockItems
                href="/submissions"
                className="motion-preset-slide-up-md motion-delay-[400ms]"
                src="/floatingDock/jedi-insignia.svg"
            />
            <FloatingDockItems
                href="/instructions"
                className="motion-preset-slide-up-md motion-delay-[500ms]"
                src="/floatingDock/falcon.svg"
            />
            <FloatingDockItems
                href="/portalfaqs"
                className="motion-preset-slide-up-md motion-delay-[600ms]"
                src="/floatingDock/sith-insignia.svg"
            />
            <FloatingDockItems
                href="/profile"
                className="motion-preset-slide-up-md motion-delay-[700ms]"
                src="/floatingDock/vader.svg"
            />
        </div>
    );
}

