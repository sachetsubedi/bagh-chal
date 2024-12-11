"use client";

import { generateGridPoints } from "@/lib/utils/utils";
import { T_GridLines } from "@/types/types";
import { useState } from "react";
import { Layer, Line, Stage } from "react-konva";

export default function Home() {
  // generateGridPoints();
  const [gridLines, setGridLines] = useState<T_GridLines>();
  return (
    <div>
      <Stage width={1000} height={600}>
        <Layer>
          {/* <Rect x={20} y={20} width={100} height={100} fill="red" draggable /> */}
          {/* <Rect x={20} y={20} width={100} height={100} fill="green" draggable /> */}
          {/* <Line stroke={"purple"} strokeWidth={3} points={[0, 0, 100, 100]} /> */}
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
