"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BACKEND_API } from "@/config/env";
import {
  generateGridPoints,
  isTigerTrapped,
  isValidMove,
} from "@/lib/utils/utils";
import { T_BoardPoints, T_GridLines } from "@/types/types";
import { useRouter } from "next/navigation";
import { FC, use, useEffect, useRef, useState } from "react";
import { Circle, Image, Layer, Line, Stage } from "react-konva";
import io, { Socket } from "socket.io-client";

interface DefaultEventsMap {
  [event: string]: (...args: any[]) => void;
}

const Home: FC<{
  params: Promise<{ roomId: string; method: string; c: string }>;
}> = ({ params }) => {
  const resolvedparams = use(params);

  const [socket, setSocket] =
    useState<Socket<DefaultEventsMap, DefaultEventsMap>>();

  const [roomFull, setRoomFull] = useState(false);

  useEffect(() => {
    const socket = io(BACKEND_API);
    setSocket(socket);
    socket.emit("joinRoom", { roomId: resolvedparams.roomId });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  // To get the window size
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const [isPhone, setIsPhone] = useState(false);

  const router = useRouter();

  // To keep track of the turn
  const [turn, setTurn] = useState<"goat" | "tiger">("goat");

  useEffect(() => {
    function handleResize() {
      const data = generateGridPoints();
      setGridLines(data?.choppedLines);
      setBoardPoints(data?.boardCords);
      setStep(data?.step ?? 0);
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      if (window.innerWidth < 768) {
        setIsPhone(true);
      } else {
        setIsPhone(false);
      }
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

  const [gameOver, setGameOver] = useState<{ winner: "tiger" | "goat" | null }>(
    { winner: null }
  );

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

  const [goatKillsCount, setGoatKillsCount] = useState<number>(0);

  // Refs to store current tiger and goat locations
  const prerenderedTigersRef = useRef(prerenderedTigers);
  const renderedGoatsRef = useRef(renderedGoats);

  useEffect(() => {
    // Update refs whenever the state changes
    prerenderedTigersRef.current = prerenderedTigers;
    renderedGoatsRef.current = renderedGoats;
  }, [prerenderedTigers, renderedGoats]);

  useEffect(() => {
    if (goatKillsCount >= 5) setGameOver({ winner: "tiger" });
  }, [goatKillsCount]);

  // Kill goat by index
  const removeGoatByIndex = (index: number) => {
    // const newRenderedGoats = renderedGoats.splice(index, 1);
    const newRenderedGoats = renderedGoats.filter((_, idx) => idx !== index);
    setRenderedGoats([...newRenderedGoats]);
  };

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

    const stepX = dx * (isPhone ? 0.1 : 0.05);
    const stepY = dy * (isPhone ? 0.1 : 0.05);

    const epsilon = 5; // Small tolerance value

    if (type === "tiger") {
      const currentTiger = prerenderedTigers[index];

      const currentCord = boardPoints.find(
        (e) => e.point === currentTiger.cord
      );

      if (!currentCord) return;

      if (!socket) return;

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
      // console.log("Rendered goats", renderedGoats);
      const currentGoat = renderedGoats[index];

      if (!currentGoat) return;

      const currentCord = boardPoints.find((e) => e.point === currentGoat.cord);

      if (!currentCord) return;

      if (!socket) return;

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

          const newGoatsLocation = [...renderedGoatsRef.current];
          newGoatsLocation[index] = currentGoat;

          console.log(renderedGoatsRef.current, newGoatsLocation);

          setRenderedGoats(() => {
            const updatedGoats = [...newGoatsLocation];
            updatedGoats[index] = currentGoat;
            return updatedGoats;
          });
          console.log("RenderedGoatsr", renderedGoats);
        } else {
          // Stop the interval when the target is reached
          clearInterval(interval);

          // Set the new cord
          const newGoatsLocation = [...renderedGoatsRef.current];
          newGoatsLocation[index] = currentGoat;
          currentGoat.cord = to;

          // Clear the x and y values
          currentGoat.x = undefined;
          currentGoat.y = undefined;

          setRenderedGoats(() => {
            const updatedGoats = [...newGoatsLocation];
            updatedGoats[index] = currentGoat;
            return updatedGoats;
          });
        }
      }, 0.5);
    }
    // setTurn(turn === "goat" ? "tiger" : "goat");
  };

  const getCurrentPosition = (index: number, type: "tiger" | "goat") => {
    if (type === "tiger") {
      const tiger = prerenderedTigers[index];
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

        if (!socket) return;

        socket.emit("positionChange", {
          roomId: resolvedparams.roomId,
          data: {
            character: "tiger",
            index: toMove.index,
            from: currentLocation[toMove.index].cord!,
            to: destination,
          },
        });

        moveCharacter(
          currentLocation[toMove.index].cord!,
          destination,
          "tiger",
          toMove.index
        );
        setTurn("goat");
      } else {
        const currentLocation = renderedGoats;
        // currentLocation[toMove.index] = destination;
        // setRenderedGoats(currentLocation);

        if (!socket) return;

        socket.emit("positionChange", {
          roomId: resolvedparams.roomId,
          data: {
            character: "goat",
            index: toMove.index,
            from: currentLocation[toMove.index].cord!,
            to: destination,
          },
        });

        moveCharacter(
          currentLocation[toMove.index].cord!,
          destination,
          "goat",
          toMove.index
        );
        setTurn("tiger");
      }
      setDestination(undefined);
      setToMove(undefined);
    }
  }, [destination, toMove, prerenderedTigers, renderedGoats]);

  const checkTigersTrapped = () => {
    let trappedCount = 0;
    if (!prerenderedTigers || !renderedGoats || !boardPoints || !gridLines)
      return;
    for (let i = 0; i < 4; i++) {
      const isTrapped = isTigerTrapped({
        tigerCord: prerenderedTigers[i].cord!,
        renderedGoats,
        boardPoints: boardPoints!,
        gridLines: gridLines!,
        renderedTigers: prerenderedTigers,
      });

      if (isTrapped) {
        trappedCount++;
      }
    }

    if (trappedCount >= 4) setGameOver({ winner: "goat" });
  };

  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (!isChanging) {
      // Fire start event
      setIsChanging(true);
    }

    // Set a debounce timer
    const debounceTimer = setTimeout(() => {
      // Fire end event
      checkTigersTrapped();
      setIsChanging(false);
    }, 100); // Adjust debounce time as needed (e.g., 100ms)

    // Cleanup timer on unmount or variable change
    return () => clearTimeout(debounceTimer);
  }, [renderedGoats, prerenderedTigers]);

  const [hoveredPoint, setHoveredPoint] = useState<number>();

  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++Socket io

  if (!socket) return;

  socket.on(
    "positionChange",
    (data: {
      character: "tiger" | "goat";
      index: number;
      from: number;
      to: number;
    }) => {
      setTurn(data.character === "tiger" ? "goat" : "tiger");
      // console.log(data);
      moveCharacter(data.from, data.to, data.character, data.index);
    }
  );

  // To place the goat
  socket.on("goatPlaced", (data: { cord: number }) => {
    setRenderedGoats([...renderedGoats, { cord: data.cord }]);
    setGoatsPlaced(goatsPlaced + 1);
    setTurn("tiger");
  });

  // To track goats killed
  socket.on("goatKilled", (data: { index: number }) => {
    setGoatKillsCount(goatKillsCount + 1);
    removeGoatByIndex(data.index);
  });

  // To track  room full
  socket.on("roomFull", () => {
    setRoomFull(true);
  });

  if (!socket) return <div>Loading...</div>;

  return (
    <div className="h-screen landing-play overflow-hidden">
      <div className="px-2 flex justify-between items-center">
        <h1 className="hidden md:block text-2xl text-white font-bold">
          BAGH CHAL
        </h1>
        <div className="flex justify-center flex-col items-center text-white">
          <div className="text-2xl font-bold text-white bg-violet-600 p-2 rounded-lg">
            {turn === "goat"
              ? `${goatsPlaced >= 20 ? "Goat's Move" : "Goat to place"} `
              : "Tiger's Move"}
          </div>
          <div>You are plaing as {resolvedparams.c}</div>
        </div>
        <div className="flex items-end mr-5 gap-2">
          <div className="p-2 bg-violet-500 text-white rounded-xl">
            Goats killed: {goatKillsCount}{" "}
          </div>
          <div className="p-2 bg-violet-500 text-white rounded-xl">
            Goats placed: {goatsPlaced}{" "}
          </div>
        </div>
      </div>

      <Stage width={windowSize.width - 20} height={windowSize.height - 25}>
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
                  preventDefault={true}
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
                    if (isChanging) return;

                    if (
                      turn === "goat" &&
                      goatsPlaced < 20 &&
                      resolvedparams.c == "goat"
                    ) {
                      // Emit the goat placed event
                      socket.emit("goatPlaced", {
                        roomId: resolvedparams.roomId,
                        data: { cord: point.point },
                      });

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

                      const { valid, goatKilled } = isValidMove({
                        from: currentPosition as T_BoardPoints,
                        to: point?.point,
                        gridLines: gridLines!,
                        boardPoints: boardPoints!,
                        step,
                        character: toMove.character,
                        renderedGoats,
                      });

                      if (valid) {
                        setDestination(point.point);
                      }

                      if (goatKilled) {
                        // Emit the event
                        socket.emit("goatKilled", {
                          roomId: resolvedparams.roomId,
                          data: {
                            index: Number(goatKilled),
                          },
                        });

                        setGoatKillsCount((prev) => prev + 1);
                        removeGoatByIndex(Number(goatKilled));
                      }
                    }
                  }}
                  onTap={() => {
                    if (isChanging) return;

                    if (
                      turn === "goat" &&
                      goatsPlaced < 20 &&
                      resolvedparams.c == "goat"
                    ) {
                      // Emit the goat placed event

                      socket.emit("goatPlaced", { cord: point.point });

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

                      const { valid, goatKilled } = isValidMove({
                        from: currentPosition as T_BoardPoints,
                        to: point?.point,
                        gridLines: gridLines!,
                        boardPoints: boardPoints!,
                        step,
                        character: toMove.character,
                        renderedGoats,
                      });

                      if (valid) {
                        setDestination(point.point);
                      }

                      if (goatKilled) {
                        setGoatKillsCount((prev) => prev + 1);
                        removeGoatByIndex(Number(goatKilled));
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
                  height={isPhone ? 70 : 100}
                  width={isPhone ? 70 : 100}
                  image={tigerImage}
                  alt="characters"
                  preventDefault={true}
                  onTap={() => {
                    if (isChanging) return;
                    // If the turn is tiger, then the tiger can move
                    if (turn === "tiger" && resolvedparams.c == "tiger")
                      setToMove({ character: "tiger", index: idx });
                  }}
                  onClick={() => {
                    if (isChanging) return;
                    // If the turn is tiger, then the tiger can move
                    if (turn === "tiger" && resolvedparams.c == "tiger")
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
                        })?.x || 0) - (isPhone ? 35 : 50)
                      : tiger.x
                      ? tiger.x - (isPhone ? 35 : 50)
                      : 0
                  }
                  y={
                    tiger.cord
                      ? (boardPoints.find((e) => {
                          return e.point === tiger.cord;
                        })?.y || 0) - (isPhone ? 35 : 50)
                      : tiger.y
                      ? tiger.y - (isPhone ? 35 : 50)
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
                  height={isPhone ? 60 : 80}
                  width={isPhone ? 60 : 80}
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
                        })?.x || 0) - (isPhone ? 30 : 40)
                      : goats.x
                      ? goats.x - (isPhone ? 30 : 40)
                      : 0
                  }
                  y={
                    goats.cord
                      ? (boardPoints.find((e) => {
                          return e.point === goats.cord;
                        })?.y || 0) - (isPhone ? 30 : 40)
                      : goats.y
                      ? goats.y - (isPhone ? 30 : 40)
                      : 0
                  }
                  onClick={() => {
                    if (isChanging) return;

                    if (
                      turn === "goat" &&
                      goatsPlaced >= 20 &&
                      resolvedparams.c == "goat"
                    ) {
                      setToMove({ character: "goat", index: idx });
                    }
                  }}
                  onTap={() => {
                    if (isChanging) return;
                    if (
                      turn === "goat" &&
                      goatsPlaced >= 20 &&
                      resolvedparams.c == "goat"
                    ) {
                      setToMove({ character: "goat", index: idx });
                    }
                  }}
                />
              );
            })}
        </Layer>
      </Stage>

      <Dialog
        open={gameOver.winner !== null}
        // open
        onOpenChange={() => {
          router.push("/");
        }}
      >
        <DialogTitle>
          {gameOver.winner === "tiger"
            ? "Tigers Win"
            : gameOver.winner === "goat"
            ? "Goats Win"
            : "Game Over"}
        </DialogTitle>
        <DialogContent className="bg-violet-400 border-none shadow-md text-white">
          <div className="text-5xl font-bold text-center text-white">
            {gameOver.winner === "tiger"
              ? "Tigers Win"
              : gameOver.winner === "goat"
              ? "Goats Win"
              : "Game Over"}
          </div>

          <div className="flex justify-center items-center text-slate-200">
            {gameOver.winner === "tiger" && (
              <div>More than 5 goats are killed </div>
            )}
            {gameOver.winner === "goat" && (
              <div>All tigers are trapped and have no moves </div>
            )}
          </div>

          <div className="flex justify-center items-center">
            <Button
              variant={"default"}
              onClick={() => {
                router.push("/");
              }}
              className="border-none border-white"
            >
              Play Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={roomFull}>
        <DialogContent>
          <DialogTitle>Room Full</DialogTitle>
          <div className="text-center">The room is full</div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
