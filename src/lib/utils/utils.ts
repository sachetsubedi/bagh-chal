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
  // Add horizontal lines
  for (let i = 0; i < gridsize; i++) {
    const y = topLeft.y + i * step;
    gridLines.push({
      from: { x: topLeft.x, y },
      to: { x: bottomRight.x, y },
    });
  }

  // Add vertical lines
  for (let i = 0; i < gridsize; i++) {
    const x = topLeft.x + i * step;
    gridLines.push({
      from: { x, y: topLeft.y },
      to: { x, y: bottomRight.y },
    });
  }

  // Add the diagonal lines
  gridLines.push({
    from: { x: topLeft.x, y: topLeft.y },
    to: { x: bottomRight.x, y: bottomRight.y },
  });

  // Add the diagonal lines
  gridLines.push({
    from: { x: topLeft.x, y: bottomRight.y },
    to: { x: bottomRight.x, y: topLeft.y },
  });

  // add the square in the grid
  // calculate the center of the each side
  const leftCenter = boardCords.find((point) => {
    return point.point === 13;
  });
  const topCenter = boardCords.find((point) => {
    return point.point === 31;
  });
  const rightCenter = boardCords.find((point) => {
    return point.point === 53;
  });
  const bottomCenter = boardCords.find((point) => {
    return point.point === 35;
  });

  // just to satisfy the typescript
  if (!topCenter || !bottomCenter || !leftCenter || !rightCenter) return;

  console.log(topCenter, bottomCenter, leftCenter, rightCenter);

  // // Add the lines
  gridLines.push({
    from: { x: topCenter.x, y: topCenter.y },
    to: { x: leftCenter.x, y: leftCenter.y },
  });

  gridLines.push({
    from: { x: leftCenter.x, y: leftCenter.y },
    to: { x: bottomCenter.x, y: bottomCenter.y },
  });

  gridLines.push({
    from: { x: bottomCenter.x, y: bottomCenter.y },
    to: { x: rightCenter.x, y: rightCenter.y },
  });

  gridLines.push({
    from: { x: rightCenter.x, y: rightCenter.y },
    to: { x: topCenter.x, y: topCenter.y },
  });

  console.log(gridLines);

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

const isValidMove = (args: { from: number; to: number }) => {};
