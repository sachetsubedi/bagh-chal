"use client";

import Coins from "@/components/Coins";
import { generateGridPoints } from "@/lib/utils/utils";
import { T_BoardPoints, T_GridLines } from "@/types/types";
import { useEffect, useState } from "react";
import { Circle, Image, Layer, Line, Stage } from "react-konva";

export default function Home() {
  // To get the window size
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // To keep track of the turn
  const [turn, setTurn] = useState<"goat" | "tiger">("goat");

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

  const [prerenderedTigers, setPrerenderedTigers] = useState([11, 15, 51, 55]);

  const [toMove, setToMove] = useState<{
    character: "goat" | "tiger";
    index: number;
  }>();

  // To set the destination of the character
  const [destination, setDestination] = useState<number>();

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

  useEffect(() => {
    console.log({ destination, toMove });

    if (destination && toMove) {
      console.log("HERE");
      const currentLocation = prerenderedTigers;
      currentLocation[toMove.index] = destination;
      setPrerenderedTigers(currentLocation);

      setDestination(undefined);
      setToMove(undefined);
    }
  }, [destination, toMove, prerenderedTigers]);

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

          {/* To set corner points */}
          {boardPoints &&
            boardPoints.map((point, idx) => {
              return (
                <Circle
                  key={idx}
                  x={point.x}
                  y={point.y}
                  radius={5}
                  fill="purple"
                  onClick={() => {
                    if (toMove) setDestination(point.point);
                  }}
                />
              );
            })}

          {/* To prerender the tigers in the corner */}
          {boardPoints &&
            prerenderedTigers.map((cord, idx) => {
              return (
                <Image
                  key={idx}
                  height={50}
                  width={50}
                  image={tigerImage}
                  alt="characters"
                  onClick={() => {
                    // If the turn is tiger, then the tiger can move
                    if (turn === "tiger")
                      setToMove({ character: "tiger", index: idx });
                  }}
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
      <button
        onClick={() => {
          setPrerenderedTigers([22, 25, 51, 55]);
        }}
      >
        Change location
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
