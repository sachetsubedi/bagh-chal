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
      <Stage width={window.innerWidth} height={window.innerHeight}>
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
