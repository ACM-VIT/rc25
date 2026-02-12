"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type DockItem = {
  href: string;
  src: string;
  alt: string;
  tooltip: string;
  width: number;
  height: number;
};

const dockItems: DockItem[] = [
  {
    href: "/",
    src: "/floatingDock/helmet.svg",
    alt: "Home",
    tooltip: "Home",
    width: 35,
    height: 44,
  },
  {
    href: "/submissions",
    src: "/floatingDock/startlight.svg",
    alt: "Submissions",
    tooltip: "Submissions",
    width: 52,
    height: 22,
  },
  {
    href: "/instructions",
    src: "/floatingDock/car.svg",
    alt: "Instructions",
    tooltip: "Instructions",
    width: 78,
    height: 32,
  },
  {
    href: "/portalfaqs",
    src: "/floatingDock/fuelnozzle.svg",
    alt: "FAQs",
    tooltip: "FAQs",
    width: 51,
    height: 29,
  },
  {
    href: "/profile",
    src: "/floatingDock/cheqflag.svg",
    alt: "Profile",
    tooltip: "Profile",
    width: 52,
    height: 33,
  },
];

function FloatingDockItem({
  href,
  src,
  alt,
  tooltip,
  width,
  height,
}: DockItem) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <div className="group relative flex items-center justify-center">
      <Link
        href={href}
        aria-label={alt}
        className={`flex items-center justify-center opacity-90 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-125 hover:opacity-100 ${isActive ? "opacity-100" : ""}`}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="object-contain transition-transform duration-300 ease-in-out"
          style={{ width: `${width}px`, height: `${height}px` }}
        />
      </Link>
      <div className="pointer-events-none absolute bottom-12 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-all duration-200 group-hover:opacity-100">
        {tooltip}
      </div>
    </div>
  );
}

export default function FloatingDock() {
  return (
    <>
      <div className="fixed bottom-[18px] left-1/2 z-50 h-[63px] w-[544px] max-w-[calc(100vw-32px)] -translate-x-1/2 border border-[#A7282D] bg-[#101010] px-[44px] py-[14px] shadow-black/20 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl">
        <div className="flex h-full items-center justify-between gap-[44px]">
          {dockItems.map((item) => (
            <FloatingDockItem key={item.href} {...item} />
          ))}
        </div>
      </div>
    </>
  );
}
