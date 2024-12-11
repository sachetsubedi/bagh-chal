import Image from "next/image";
import { FC } from "react";

const Coins: FC<{ type: "goat" | "tiger"; x: number; y: number }> = ({
  type,
  x,
  y,
}) => {
  return (
    <div
      className={`rounded-full absolue w-fit ${
        type === "goat" ? "bg-lime-500 " : "bg-orange-500"
      }   `}
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <Image src={`/${type}.png`} width={50} height={50} alt="character" />
    </div>
  );
};

export default Coins;
