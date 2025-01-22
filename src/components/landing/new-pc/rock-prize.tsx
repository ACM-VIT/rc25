import rock from "../../../../public/landing_new/rock.png";
import Image from "next/image";

interface PrizeProps {
  prize: number;
  position: string;
  height: number;
  width: number;
  positionTextSize: string; // e.g., "text-7xl"
  prizeTextSize: string; // e.g., "text-6xl"
}

const Prizerock = ({
  prize,
  position,
  height,
  width,
  positionTextSize,
  prizeTextSize,
}: PrizeProps) => {
  return (
    <div className="relative hover:scale-[1.05] cursor-pointer transition-transform duration-300">
      <div
        className={`absolute top-0 left-0 right-0 font-bold z-10 text-center text-white orbitron p-4 ${positionTextSize}`}
      >
        {position}
        <div className={`mt-2 ${prizeTextSize}`}>₹{prize.toLocaleString()}</div>
      </div>
      <Image src={rock} alt="rock" height={height} width={width} />
    </div>
  );
};

export default Prizerock;
