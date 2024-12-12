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

  const [prerenderedTigers, setPrerenderedTigers] = useState<
    { cord?: number; x?: number; y?: number }[]
  >([{ cord: 11 }, { cord: 15 }, { cord: 51 }, { cord: 55 }]);

  const [renderedGoats, setRenderedGoats] = useState<number[]>([]);

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
  const [goatsPlaced, setGoatsPlaced] = useState(0);

  const moveCharacter = (
    from: number,
    to: number,
    type: "tiger" | "goat",
    index: number
  ) => {
    if (!boardPoints) return;

    const fromCords = boardPoints.find((e) => e.point === from);
    const toCords = boardPoints.find((e) => e.point === to);

    if (!fromCords || !toCords) return;

    const dx = toCords.x - fromCords.x;
    const dy = toCords.y - fromCords.y;

    const stepX = dx * 0.1;
    const stepY = dy * 0.1;

    if (type === "tiger") {
      const currentTiger = prerenderedTigers[index];

      const currentCord = boardPoints.find(
        (e) => e.point === currentTiger.cord
      );

      if (!currentCord) return;

      // console.log({ currentCord, currentTiger, toCords });

      // remove the cord from the tigers's location (to set custom x and y values slowly)
      currentTiger.cord = undefined;

      // set the new x and y values
      // Initialize coordinates if undefined
      if (!currentTiger.x || !currentTiger.y) {
        currentTiger.x = currentCord.x;
        currentTiger.y = currentCord.y;
      }

      const interval = setInterval(() => {
        // Just to satisfy ts
        if (!currentTiger.x || !currentTiger.y) return;

        // Update coordinates step by step
        if (currentTiger.x !== toCords.x) {
          // console.log(toCords);
          currentTiger.x += stepX;
          currentTiger.y += stepY;

          const newTigersLocations = prerenderedTigers;
          newTigersLocations[index] = currentTiger;
          console.log(fromCords, toCords, newTigersLocations);

          setPrerenderedTigers([...newTigersLocations]);
        } else {
          // Stop the interval when the target is reached
          clearInterval(interval);

          // Set the new cord
          currentTiger.cord = to;
        }
      }, 100); // Adjust the interval time (100ms in this case) as needed
    }
  };

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
    if (destination && toMove) {
      if (toMove.character === "tiger") {
        const currentLocation = prerenderedTigers;
        // currentLocation[toMove.index].cord = destination;
        // setPrerenderedTigers(currentLocation);

        moveCharacter(
          currentLocation[toMove.index].cord!,
          destination,
          "tiger",
          toMove.index
        );
      } else {
        const currentLocation = renderedGoats;
        currentLocation[toMove.index] = destination;
        setRenderedGoats(currentLocation);
      }
      setDestination(undefined);
      setToMove(undefined);
      setTurn(turn === "goat" ? "tiger" : "goat");
    }
  }, [destination, toMove, prerenderedTigers]);

  useEffect(() => {
    console.log(renderedGoats);
  }, [renderedGoats]);

  return (
    <div>
      <div className="flex justify-center">
        <h1>Turn: {turn}</h1>
      </div>
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
                  radius={15}
                  // fill="purple"
                  onClick={() => {
                    if (turn === "goat" && goatsPlaced < 20) {
                      // If the turn and all goats are not placed, then place the goat
                      setRenderedGoats([...renderedGoats, point.point]);
                      setGoatsPlaced(goatsPlaced + 1);
                      setTurn("tiger");
                    }
                    if (toMove) setDestination(point.point);
                  }}
                />
              );
            })}

          {/* To prerender the tigers in the corner */}
          {boardPoints &&
            prerenderedTigers.map((tiger, idx) => {
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
                    tiger.cord
                      ? (boardPoints.find((e) => {
                          return e.point === tiger.cord;
                        })?.x || 0) - 25
                      : tiger.x
                      ? tiger.x - 25
                      : 0
                  }
                  y={
                    tiger.cord
                      ? (boardPoints.find((e) => {
                          return e.point === tiger.cord;
                        })?.y || 0) - 25
                      : tiger.y
                      ? tiger.y - 25
                      : 0
                  }
                />
              );
            })}

          {/* TO render goats */}

          {boardPoints &&
            renderedGoats.map((cords, idx) => {
              return (
                <Image
                  key={idx}
                  height={50}
                  width={50}
                  image={goatImage}
                  alt="characters"
                  x={
                    (boardPoints.find((e) => {
                      return e.point === cords;
                    })?.x || 0) - 25
                  }
                  y={
                    (boardPoints.find((e) => {
                      return e.point === cords;
                    })?.y || 0) - 25
                  }
                  onClick={() => {
                    if (turn === "goat" && goatsPlaced >= 20) {
                      setToMove({ character: "goat", index: idx });
                    }
                  }}
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
          // setPrerenderedTigers([22, 25, 51, 55]);
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
