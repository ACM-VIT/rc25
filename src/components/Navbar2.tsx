import Image from "next/legacy/image";
import smalllogo from "@/app/assets/smalllogo.png";

export default function Navbar2() {
  return (
    <nav className="bg-[radial-gradient(110.8%_70.71%_at_50%_50%,_#0B0014_55.41%,_#18181B_100%)] text-white p-4">
      <div className="container mx-auto flex items-center">
        <div className="flex-shrink-0">
          <Image 
            src={smalllogo}
            alt="Logo" 
            width={80} 
            height={80} 
            className="rounded-md" 
          />
        </div>
      </div>
    </nav>
  );
}
