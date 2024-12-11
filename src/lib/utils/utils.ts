import { T_GridLines } from "@/types/types";

export const generateGridPoints = () => {
  const gridLines: T_GridLines = [];

  const { bottomRight, topLeft } = generateCenteredBoardPoints(400, 400);

  // Calculate the step size
  const step = (bottomRight.x - topLeft.x) / 4;

  // Add left boundry lines
  for (let i = topLeft.y; i < bottomRight.y; i += step) {
    gridLines.push({
      from: { x: topLeft.x, y: i },
      to: { x: topLeft.x, y: i + step },
    });
  }

  // Add right boundry lines
  for (let i = topLeft.y; i < bottomRight.y; i += step) {
    gridLines.push({
      from: { x: bottomRight.x, y: i },
      to: { x: bottomRight.x, y: i + step },
    });
  }

  // Add top boundry lines
  for (let i = topLeft.x; i < bottomRight.x; i += step) {
    gridLines.push({
      from: { x: i, y: topLeft.y },
      to: { x: i + step, y: topLeft.y },
    });
  }

  // Add bottom boundry lines
  for (let i = topLeft.x; i < bottomRight.x; i += step) {
    gridLines.push({
      from: { x: i, y: bottomRight.y },
      to: { x: i + step, y: bottomRight.y },
    });
  }

  // add vertical lines
  for (let i = topLeft.x; i < bottomRight.x; i += step) {
    for (let j = topLeft.y; j < bottomRight.y; j += step) {
      gridLines.push({
        from: { x: i, y: j },
        to: { x: i, y: j + step },
      });
    }
  }

  // add horizontal lines
  for (let i = topLeft.y; i < bottomRight.y; i += step) {
    for (let j = topLeft.x; j < bottomRight.x; j += step) {
      gridLines.push({
        from: { x: j, y: i },
        to: { x: j + step, y: i },
      });
    }
  }
  console.log(gridLines);

  return gridLines;
};

// Assuming the board has a fixed width and height, e.g., 600x600
const generateCenteredBoardPoints = (
  boardWidth: number,
  boardHeight: number
) => {
  // Get the width and height of the window
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Calculate the top-left corner (x, y) to center the board
  const x = (screenWidth - boardWidth) / 2;
  const y = (screenHeight - boardHeight) / 2;

  // Calculate the bottom-right corner (x2, y2)
  const x2 = x + boardWidth;
  const y2 = y + boardHeight;

  // Return the diagonal points (top-left and bottom-right)
  return { topLeft: { x, y }, bottomRight: { x: x2, y: y2 } };
};
