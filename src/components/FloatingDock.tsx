import { BadgeHelp, Info, LayoutDashboard, MailCheck, UserRound } from "lucide-react";
import Link from "next/link";

function FloatingDockItems({ href, children: Icon, className }: { href:string ,children: React.ReactNode, className?: string }) {
    return (
        <Link href={href} className={`bg-secondary/40 p-2 rounded-full hover:scale-[200%] hover:-translate-y-1 hover:text-accent duration-100 transition-all ${className}`}>
            {Icon}
        </Link>
    );
}

export default function FloatingDock() {
    return (
        <div className="bg-secondary/60 text-text flex shadow-lg justify-between backdrop-blur-3xl w-[250px] px-4 py-2 rounded-xl  transition-all
            fixed bottom-2 left-1/2 transform -translate-x-1/2  hover:p4 hover:shadow-xl shadow-black/20 hover:-translate-y-2 hover:w-[300px] hover:scale-110
            hover:motion-translate-y-loop-[5%] motion-ease-in-out motion-duration-2000 motion-preset-slide-up-md">
            <FloatingDockItems href="#" className="motion-preset-slide-up-md motion-delay-[300ms]">
                <LayoutDashboard />
            </FloatingDockItems>
            <FloatingDockItems href="#" className="motion-preset-slide-up-md motion-delay-[400ms]">
                <MailCheck />
            </FloatingDockItems>
            <FloatingDockItems href="#" className="motion-preset-slide-up-md motion-delay-[500ms]">
                <Info />
            </FloatingDockItems>
            <FloatingDockItems href="#" className="motion-preset-slide-up-md motion-delay-[600ms]">
                <BadgeHelp />
            </FloatingDockItems>
            <FloatingDockItems href="#" className="motion-preset-slide-up-md motion-delay-[700ms]">
                <UserRound />
            </FloatingDockItems>
        </div>
    );
}

