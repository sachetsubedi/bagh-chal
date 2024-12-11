"use client";

import { generateGridPoints } from "@/lib/utils/utils";
import { T_GridLines } from "@/types/types";
import { useEffect, useState } from "react";
import { Layer, Line, Stage } from "react-konva";

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

  // generateGridPoints();
  const [gridLines, setGridLines] = useState<T_GridLines>();

  return (
    <div>
      <Stage width={windowSize.width} height={windowSize.height}>
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
        </Layer>
      </Stage>
      <button
        onClick={() => {
          setGridLines(generateGridPoints());
        }}
      >
        Generate
      </button>
    </div>
  );
}
