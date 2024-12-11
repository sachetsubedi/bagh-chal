"use client";

import { generateGridPoints } from "@/lib/utils/utils";

export default function Home() {
  // generateGridPoints();
  return (
    <div>
      {/* <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Rect x={20} y={20} width={100} height={100} fill="red" draggable />
          <Rect x={20} y={20} width={100} height={100} fill="green" draggable />
          <Line stroke={"purple"} strokeWidth={3} points={[0, 0, 100, 100]} />
        </Layer>
      </Stage> */}
      <button onClick={generateGridPoints}>Generate</button>
    </div>
  );
}
