import { T_GridLines } from "@/types/types";

export const generateGridPoints = () => {
  const gridLines: T_GridLines = [];

  const startPoint = 0;
  const endPoint = 500;

  // Calculate the step size
  const step = (endPoint - startPoint) / 5;

  // Add left boundry lines
  for (let i = startPoint; i < endPoint; i += step) {
    gridLines.push({
      from: { x: startPoint, y: i },
      to: { x: startPoint, y: i + step },
    });
  }

  // Add right boundry lines
  for (let i = startPoint; i < endPoint; i += step) {
    gridLines.push({
      from: { x: endPoint, y: i },
      to: { x: endPoint, y: i + step },
    });
  }

  // Add top boundry lines
  for (let i = startPoint; i < endPoint; i += step) {
    gridLines.push({
      from: { x: i, y: startPoint },
      to: { x: i + step, y: startPoint },
    });
  }

  // Add bottom boundry lines
  for (let i = startPoint; i < endPoint; i += step) {
    gridLines.push({
      from: { x: i, y: endPoint },
      to: { x: i + step, y: endPoint },
    });
  }

  // add horizontal lines
  for (let i = startPoint; i < endPoint; i += step) {
    for (let j = startPoint; j < endPoint; j += step) {
      gridLines.push({
        from: { x: i, y: j },
        to: { x: i, y: j + step },
      });
    }
  }

  // add vertical lines
  for (let i = startPoint; i < endPoint; i += step) {
    for (let j = startPoint; j < endPoint; j += step) {
      gridLines.push({
        from: { x: j, y: i },
        to: { x: j + step, y: i },
      });
    }
  }

  //   console.log(gridLines);
  return gridLines;
};
