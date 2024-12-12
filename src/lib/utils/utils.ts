import { T_BoardPoints, T_GridLines } from "@/types/types";

export const generateGridPoints = () => {
  const gridLines: T_GridLines = [];

  // Generate centered board points based on the dynamic size
  const { bottomRight, topLeft } = generateCenteredBoardPoints();

  const gridsize = 4;

  // Calculate the step size
  const step = (bottomRight.x - topLeft.x) / gridsize;

  const boardCords = calculateBoardCords({
    boardSize: gridsize,
    x: topLeft.x,
    y: topLeft.y,
    step: step,
  });

  // Add left boundary lines
  for (let i = topLeft.y; i < bottomRight.y; i += step) {
    gridLines.push({
      from: { x: topLeft.x, y: i },
      to: { x: topLeft.x, y: i + step },
    });
  }

  // Add right boundary lines
  for (let i = topLeft.y; i < bottomRight.y; i += step) {
    gridLines.push({
      from: { x: bottomRight.x, y: i },
      to: { x: bottomRight.x, y: i + step },
    });
  }

  // Add top boundary lines
  for (let i = topLeft.x; i < bottomRight.x; i += step) {
    gridLines.push({
      from: { x: i, y: topLeft.y },
      to: { x: i + step, y: topLeft.y },
    });
  }

  // Add bottom boundary lines
  for (let i = topLeft.x; i < bottomRight.x; i += step) {
    gridLines.push({
      from: { x: i, y: bottomRight.y },
      to: { x: i + step, y: bottomRight.y },
    });
  }

  // Add vertical lines
  for (let i = topLeft.x; i < bottomRight.x; i += step) {
    for (let j = topLeft.y; j < bottomRight.y; j += step) {
      gridLines.push({
        from: { x: i, y: j },
        to: { x: i, y: j + step },
      });
    }
  }

  // Add horizontal lines
  for (let i = topLeft.y; i < bottomRight.y; i += step) {
    for (let j = topLeft.x; j < bottomRight.x; j += step) {
      gridLines.push({
        from: { x: j, y: i },
        to: { x: j + step, y: i },
      });
    }
  }

  return { gridLines, boardCords };
};

// Generate centered board points based on dynamic width and height
const generateCenteredBoardPoints = () => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Determine the base dimension for the grid (height or width)
  let boardSize;
  if (screenHeight < screenWidth) {
    // If height is less than width, set the board size to 80% of the height
    boardSize = screenHeight * 0.8;
  } else {
    // If width is less than height, set the board size to 80% of the width
    boardSize = screenWidth * 0.8;
  }

  // Calculate the top-left corner (x, y) to center the board
  const x = (screenWidth - boardSize) / 2;
  const y = (screenHeight - boardSize) / 2;

  // Calculate the bottom-right corner (x2, y2)
  const x2 = x + boardSize;
  const y2 = y + boardSize;

  // Return the diagonal points (top-left and bottom-right)
  return { topLeft: { x, y }, bottomRight: { x: x2, y: y2 } };
};

// Calculate the board coordinates based on grid size and step
const calculateBoardCords = (args: {
  x: number;
  y: number;
  step: number;
  boardSize: number;
}) => {
  const boardCords: { point: T_BoardPoints; x: number; y: number }[] = [];

  const { x, y, step, boardSize } = args;

  for (let i = 0; i <= boardSize; i++) {
    for (let j = 0; j <= boardSize; j++) {
      boardCords.push({
        point: ((i + 1) * 10 + j + 1) as T_BoardPoints,
        x: x + i * step,
        y: y + j * step,
      });
    }
  }

  return boardCords;
};
