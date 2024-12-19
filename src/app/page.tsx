"use client";
import { generateGridPoints, isValidMove } from "@/lib/utils/utils";
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

  const [renderedGoats, setRenderedGoats] = useState<
    { cord?: number; x?: number; y?: number }[]
  >([]);

  const [toMove, setToMove] = useState<{
    character: "goat" | "tiger";
    index: number;
  }>();

  const [step, setStep] = useState<number>(0);

  // To set the destination of the character
  const [destination, setDestination] = useState<number>();

  // generateGridPoints();
  const [gridLines, setGridLines] = useState<T_GridLines>();

  const [boardPoints, setBoardPoints] =
    useState<{ point: T_BoardPoints; x: number; y: number }[]>();

  // Init the images
  const [tigerImage, setTigerImage] = useState<HTMLImageElement>();
  const [goatImage, setGoatImage] = useState<HTMLImageElement>();

  // To track no of goats placed
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

    const stepX = dx * 0.01;
    const stepY = dy * 0.01;

    const epsilon = 0.5; // Small tolerance value

    if (type === "tiger") {
      const currentTiger = prerenderedTigers[index];

      const currentCord = boardPoints.find(
        (e) => e.point === currentTiger.cord
      );

      if (!currentCord) return;

      // Remove the cord from the tiger's location
      currentTiger.cord = undefined;

      // Initialize coordinates if undefined
      if (!currentTiger.x || !currentTiger.y) {
        currentTiger.x = currentCord.x;
        currentTiger.y = currentCord.y;
      }

      const interval = setInterval(() => {
        if (!currentTiger.x || !currentTiger.y) {
          currentTiger.x = currentCord.x;
          currentTiger.y = currentCord.y;
        }

        // Update coordinates step by step
        if (
          Math.abs(currentTiger.x - toCords.x) > epsilon ||
          Math.abs(currentTiger.y - toCords.y) > epsilon
        ) {
          currentTiger.x += stepX;
          currentTiger.y += stepY;

          const newTigersLocations = prerenderedTigers;
          newTigersLocations[index] = currentTiger;

          setPrerenderedTigers([...newTigersLocations]);
        } else {
          // Stop the interval when the target is reached
          clearInterval(interval);

          // Set the new cord
          const newTigersLocations = prerenderedTigers;
          newTigersLocations[index] = currentTiger;
          currentTiger.cord = to;

          // Clear the x and y values
          currentTiger.x = undefined;
          currentTiger.y = undefined;

          setPrerenderedTigers([...newTigersLocations]);
        }
      }, 1);
    } else if (type === "goat") {
      const currentGoat = renderedGoats[index];

      const currentCord = boardPoints.find((e) => e.point === currentGoat.cord);

      if (!currentCord) return;

      // Remove the cord from the tiger's location
      currentGoat.cord = undefined;

      // Initialize coordinates if undefined
      if (!currentGoat.x || !currentGoat.y) {
        currentGoat.x = currentCord.x;
        currentGoat.y = currentCord.y;
      }

      const interval = setInterval(() => {
        if (!currentGoat.x || !currentGoat.y) {
          currentGoat.x = currentCord.x;
          currentGoat.y = currentCord.y;
        }

        // Update coordinates step by step
        if (
          Math.abs(currentGoat.x - toCords.x) > epsilon ||
          Math.abs(currentGoat.y - toCords.y) > epsilon
        ) {
          currentGoat.x += stepX;
          currentGoat.y += stepY;

          const newGoatsLocation = renderedGoats;
          newGoatsLocation[index] = currentGoat;

          setRenderedGoats([...newGoatsLocation]);
        } else {
          // Stop the interval when the target is reached
          clearInterval(interval);

          // Set the new cord
          const newGoatsLocation = renderedGoats;
          newGoatsLocation[index] = currentGoat;
          currentGoat.cord = to;

          // Clear the x and y values
          currentGoat.x = undefined;
          currentGoat.y = undefined;

          setRenderedGoats([...newGoatsLocation]);
        }
      }, 0.5);
    }
  };

  const getCurrentPosition = (index: number, type: "tiger" | "goat") => {
    if (type === "tiger") {
      const tiger = prerenderedTigers[index];
      console.log(index, type);
      return tiger.cord;
    } else {
      const goat = renderedGoats[index];
      return goat.cord;
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
        // currentLocation[toMove.index] = destination;
        // setRenderedGoats(currentLocation);
        moveCharacter(
          currentLocation[toMove.index].cord!,
          destination,
          "goat",
          toMove.index
        );
      }
      setDestination(undefined);
      setToMove(undefined);
      setTurn(turn === "goat" ? "tiger" : "goat");
    }
  }, [destination, toMove, prerenderedTigers, renderedGoats]);

  const [hoveredPoint, setHoveredPoint] = useState<number>();

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
                  fill={hoveredPoint === point.point ? "purple" : undefined}
                  onMouseEnter={(e) => {
                    const stage = e.target.getStage();
                    if (!stage) return;
                    stage.container().style.cursor = "pointer";
                  }}
                  onMouseLeave={(e) => {
                    const stage = e.target.getStage();
                    if (!stage) return;
                    stage.container().style.cursor = "default";
                  }}
                  onMouseOver={() => setHoveredPoint(point.point)}
                  onMouseOut={() => setHoveredPoint(undefined)}
                  // fill="purple"
                  onClick={() => {
                    if (turn === "goat" && goatsPlaced < 20) {
                      // If the turn and all goats are not placed, then place the goat
                      setRenderedGoats([
                        ...renderedGoats,
                        { cord: point.point },
                      ]);
                      setGoatsPlaced(goatsPlaced + 1);
                      setTurn("tiger");
                    }
                    if (toMove) {
                      const currentPosition = getCurrentPosition(
                        toMove.index,
                        toMove.character
                      );
                      if (
                        isValidMove({
                          from: currentPosition as T_BoardPoints,
                          to: point?.point,
                          gridLines: gridLines!,
                          boardPoints: boardPoints!,
                          step,
                          character: toMove.character,
                          renderedGoats,
                        })
                      ) {
                        console.log("ius valid");
                        setDestination(point.point);
                      }
                    }
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
                  height={100}
                  width={100}
                  image={tigerImage}
                  alt="characters"
                  onClick={() => {
                    // If the turn is tiger, then the tiger can move
                    if (turn === "tiger")
                      setToMove({ character: "tiger", index: idx });
                  }}
                  onMouseEnter={(e) => {
                    const stage = e.target.getStage();
                    if (!stage || turn !== "tiger") return;
                    stage.container().style.cursor = "pointer";
                  }}
                  onMouseLeave={(e) => {
                    const stage = e.target.getStage();
                    if (!stage) return;
                    stage.container().style.cursor = "default";
                  }}
                  cornerRadius={1000}
                  scale={
                    toMove?.character === "tiger" && toMove.index === idx
                      ? { x: 1.01, y: 1.01 }
                      : { x: 1, y: 1 }
                  }
                  sca
                  shadowColor={
                    toMove?.character === "tiger" && toMove.index === idx
                      ? "red"
                      : undefined
                  }
                  shadowEnabled={
                    toMove?.character === "tiger" && toMove.index === idx
                  }
                  shadowOffsetX={3}
                  shadowOffsetY={5}
                  x={
                    tiger.cord
                      ? (boardPoints.find((e) => {
                          return e.point === tiger.cord;
                        })?.x || 0) - 50
                      : tiger.x
                      ? tiger.x - 50
                      : 0
                  }
                  y={
                    tiger.cord
                      ? (boardPoints.find((e) => {
                          return e.point === tiger.cord;
                        })?.y || 0) - 50
                      : tiger.y
                      ? tiger.y - 50
                      : 0
                  }
                />
              );
            })}

          {/* TO render goats */}

          {boardPoints &&
            renderedGoats.map((goats, idx) => {
              return (
                <Image
                  key={idx}
                  height={80}
                  width={80}
                  image={goatImage}
                  alt="characters"
                  onMouseEnter={(e) => {
                    const stage = e.target.getStage();
                    if (!stage || turn !== "goat" || goatsPlaced >= 20) return;
                    stage.container().style.cursor = "pointer";
                  }}
                  onMouseLeave={(e) => {
                    const stage = e.target.getStage();
                    if (!stage) return;
                    stage.container().style.cursor = "default";
                  }}
                  shadowColor={
                    toMove?.character === "goat" && toMove.index === idx
                      ? "green"
                      : undefined
                  }
                  shadowEnabled={
                    toMove?.character === "goat" && toMove.index === idx
                  }
                  shadowOffsetX={3}
                  shadowOffsetY={5}
                  x={
                    goats.cord
                      ? (boardPoints.find((e) => {
                          return e.point === goats.cord;
                        })?.x || 0) - 40
                      : goats.x
                      ? goats.x - 40
                      : 0
                  }
                  y={
                    goats.cord
                      ? (boardPoints.find((e) => {
                          return e.point === goats.cord;
                        })?.y || 0) - 40
                      : goats.y
                      ? goats.y - 40
                      : 0
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
          const data = generateGridPoints();
          setGridLines(data?.choppedLines);
          setBoardPoints(data?.boardCords);
          setStep(data?.step ?? 0);
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
    </div>
  );
}
