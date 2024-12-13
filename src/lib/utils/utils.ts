import { T_BoardPoints, T_GridLines } from "@/types/types";
import { diagonalValidMoves } from "../data";

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

  // Chop the lines into smaller segments
  const choppedLines = chopLines(gridLines, step);
  return { choppedLines, boardCords };
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

// type T_MoveArgs = { from: number; to: number };

export const isValidMove = (args: {
  from: T_BoardPoints;
  to: T_BoardPoints;
  gridLines: T_GridLines;
  boardPoints: { point: T_BoardPoints; x: number; y: number }[];
}) => {
  const { from, to, gridLines, boardPoints } = args;

  // Check in predefined valid moves for diagonal paths
  const isValid = diagonalValidMoves.find((move) => {
    return (
      (move.from == from && move.to == to) ||
      (move.from == to && move.to == from)
    );
  });
  if (isValid) return true;

  const isInGridLine = gridLines.find((line) => {
    const lineFromCord = boardPoints.find((point) => {
      return point.x == line.from.x && point.y == line.from.y;
    });

    const lineToCord = boardPoints.find((point) => {
      return point.x == line.to.x && point.y == line.to.y;
    });

    if (!lineFromCord || !lineToCord) return false;

    return (
      (lineFromCord?.point == from && lineToCord.point == to) ||
      (lineFromCord?.point == to && lineToCord.point == from)
    );
  });

  if (isInGridLine) return true;
  return false;
};

type Point = { x: number; y: number };
type Line = { from: Point; to: Point };

const chopLines = (lines: Line[], segmentSize: number) => {
  const choppedLines: Line[] = [];

  lines.forEach((line) => {
    choppedLines.push(...chopLine(line, segmentSize));
  });

  return choppedLines;
};

const chopLine = (line: Line, segmentSize: number): Line[] => {
  const { from, to } = line;

  // Calculate the direction vector (difference between points)
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  // Calculate the total length of the line
  const length = Math.sqrt(dx * dx + dy * dy);

  // Calculate the number of segments
  const numSegments = Math.ceil(length / segmentSize);

  // Calculate the unit vector (direction normalized to 1)
  const unitX = dx / length;
  const unitY = dy / length;

  const segments: Line[] = [];

  for (let i = 0; i < numSegments; i++) {
    const start = {
      x: from.x + unitX * segmentSize * i,
      y: from.y + unitY * segmentSize * i,
    };
    const end =
      i === numSegments - 1
        ? to // Ensure the last segment ends exactly at the 'to' point
        : {
            x: from.x + unitX * segmentSize * (i + 1),
            y: from.y + unitY * segmentSize * (i + 1),
          };

    segments.push({ from: start, to: end });
  }

  return segments;
};
