"use client";

import Coins from "@/components/Coins";
import { generateGridPoints } from "@/lib/utils/utils";
import { T_BoardPoints, T_GridLines } from "@/types/types";
import { useEffect, useState } from "react";
import { Image, Layer, Line, Stage } from "react-konva";

export default function Home() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const prerenderedTigers = [11, 15, 51, 55];

  // generateGridPoints();
  const [gridLines, setGridLines] = useState<T_GridLines>();

  const [boardPoints, setBoardPoints] =
    useState<{ point: T_BoardPoints; x: number; y: number }[]>();

  // Init the images
  const [tigerImage, setTigerImage] = useState<HTMLImageElement>();
  const [goatImage, setGoatImage] = useState<HTMLImageElement>();

  // Load the images when the component mounts
  useEffect(() => {
    const tigerImg = new window.Image();
    tigerImg.src = "/tiger.png";
    tigerImg.onload = () => {
      setTigerImage(tigerImg);
    };

    const goatImg = new window.Image();
    goatImg.src = "/goat.png";
    goatImg.onload = () => {
      setGoatImage(goatImg);
    };
  }, []);

  return (
    <div>
      <Stage
        width={windowSize.width}
        height={windowSize.height}
        className="relative"
      >
        <Layer>
          {gridLines?.map((line, idx) => {
            return (
              <Line
                key={idx}
                stroke={"purple"}
                strokeWidth={3}
                points={[line.from.x, line.from.y, line.to.x, line.to.y]}
              />
            );
          })}

          {/* <Image height={100} width={100} image={image} alt="characters" /> */}
          {boardPoints &&
            prerenderedTigers.map((cord, idx) => {
              return (
                // <Coins
                //   key={cord}
                //   type="tiger"
                //   x={
                //     boardPoints.find((e) => {
                //       return e.point === cord;
                //     })?.x || 0
                //   }
                //   y={
                //     boardPoints.find((e) => {
                //       return e.point === cord;
                //     })?.y || 0
                //   }
                // />
                <Image
                  key={idx}
                  height={50}
                  width={50}
                  image={tigerImage}
                  alt="characters"
                  x={
                    (boardPoints.find((e) => {
                      return e.point === cord;
                    })?.x || 0) - 25
                  }
                  y={
                    (boardPoints.find((e) => {
                      return e.point === cord;
                    })?.y || 0) - 25
                  }
                />
              );
            })}
        </Layer>
      </Stage>
      <button
        onClick={() => {
          setGridLines(generateGridPoints().gridLines);
          setBoardPoints(generateGridPoints().boardCords);
        }}
      >
        Generate
      </button>
      {boardPoints?.map((point, idx) => {
        return (
          <Coins
            key={idx}
            type={[11, 15, 51, 55].includes(point.point) ? "tiger" : "goat"}
            x={point.x}
            y={point.y}
          />
        );
      })}
    </div>
  );
}
