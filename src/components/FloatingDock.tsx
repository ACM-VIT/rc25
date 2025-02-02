import { BadgeHelp, Info, LayoutDashboard, MailCheck, UserRound } from "lucide-react";
import Link from "next/link";

function FloatingDockItems({ href, children: Icon, className }: { href: string; children: React.ReactNode; className?: string }) {
    return (
        <Link
            href={href}
            className={`bg-secondary/40 p-2 rounded-full 
            transition-all duration-300 ease-in-out
            hover:scale-125 hover:-translate-y-1 hover:text-accent ${className}`}
        >
            {Icon}
        </Link>
    );
}

export default function FloatingDock() {
    return (
        <div
            className="bg-secondary/60 text-text flex shadow-lg justify-between backdrop-blur-3xl 
            w-[250px] px-4 py-2 rounded-xl fixed bottom-2 left-1/2 transform -translate-x-1/2 
            z-50 transition-all duration-300 ease-in-out
            hover:w-[270px] hover:-translate-y-2 hover:scale-110 hover:shadow-lg"
        >
            <FloatingDockItems href="/" className="motion-preset-slide-up-md motion-delay-[300ms]">
                <LayoutDashboard />
            </FloatingDockItems>
            <FloatingDockItems href="/submissions" className="motion-preset-slide-up-md motion-delay-[400ms]">
                <MailCheck />
            </FloatingDockItems>
            <FloatingDockItems href="/instructions" className="motion-preset-slide-up-md motion-delay-[500ms]">
                <Info />
            </FloatingDockItems>
            <FloatingDockItems href="/portalfaqs" className="motion-preset-slide-up-md motion-delay-[600ms]">
                <BadgeHelp />
            </FloatingDockItems>
            <FloatingDockItems href="/profile" className="motion-preset-slide-up-md motion-delay-[700ms]">
                <UserRound />
            </FloatingDockItems>
        </div>
    );
}