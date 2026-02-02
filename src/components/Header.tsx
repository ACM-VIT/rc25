import { formula1Wide } from "@/lib/fonts";

interface HeaderProps {
  title?: string;
}

const Header = ({ title }: HeaderProps) => {
  return (
<header className="relative w-full h-[clamp(60px,9vw,90px)] bg-transparent overflow-hidden">

      <img
      src="/Rectangle 9454.png"
        alt=""
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 translate-x-[6%] w-full h-[80%] max-w-[1360px] mx-auto z-[1]"
      />

      <div className="relative z-[2] h-full flex items-center justify-between px-[clamp(12px,4vw,32px)] max-w-[1920px] mx-auto">

        <img
          src="/topbar-car.png"
          alt="RC Car"
          className="w-[clamp(200px,30vw,350px)] h-[clamp(100px,15vw,180px)] shrink-0 -translate-x-[5%] translate-y-[4%] object-contain"
        />

        <h1 className={`${formula1Wide.className} text-white text-[clamp(12px,2vw,36px)] whitespace-nowrap`}>
          {title}
        </h1>

      </div>
    </header>
  );
};

export default Header;