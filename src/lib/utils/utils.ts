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

  // // Add left boundary lines
  // for (let i = topLeft.y; i < bottomRight.y; i += step) {
  //   gridLines.push({
  //     from: { x: topLeft.x, y: i },
  //     to: { x: topLeft.x, y: i + step },
  //   });
  // }

  // Add right boundary lines
  for (let i = topLeft.y; i < bottomRight.y; i += step) {
    gridLines.push({
      from: { x: bottomRight.x, y: i },
      to: { x: bottomRight.x, y: i + step },
    });
  }

  // Add bottom boundary lines
  for (let i = topLeft.x; i < bottomRight.x; i += step) {
    gridLines.push({
      from: { x: i, y: bottomRight.y },
      to: { x: i + step, y: bottomRight.y },
    });
  }

  // // Add top boundary lines
  // for (let i = topLeft.x; i < bottomRight.x; i += step) {
  //   gridLines.push({
  //     from: { x: i, y: topLeft.y },
  //     to: { x: i + step, y: topLeft.y },
  //   });
  // }

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

  return { choppedLines, boardCords, step };
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
  step: number;
  character: "tiger" | "goat";
  renderedGoats: { cord?: number; x?: number; y?: number }[];
}): { valid: boolean; goatKilled?: number } => {
  const { from, to, gridLines, boardPoints, step } = args;

  // Firstly check if the mover is tiger and check if there is a kill
  if (args.character === "tiger") {
    const startCords = boardPoints.find((point) => {
      return point.point == from;
    });
    const endCords = boardPoints.find((point) => {
      return point.point == to;
    });

    const choppedPathCustom = chopLineCustom(
      {
        from: { x: startCords?.x ?? 0, y: startCords?.y ?? 0 },
        to: { x: endCords?.x ?? 0, y: endCords?.y ?? 0 },
      },
      step
    );

    console.log(choppedPathCustom);

    const choppedPath = chopLine(
      {
        from: { x: startCords?.x ?? 0, y: startCords?.y ?? 0 },
        to: { x: endCords?.x ?? 0, y: endCords?.y ?? 0 },
      },
      step
    );

    // console.log(choppedPath.length);

    if (choppedPath.length === 2) {
      // means there is a point gap between the two cords
      // check if there is a goat in the middle

      const tolerance = 40; // Adjust the tolerance
      const middleLine = choppedPath[0].to; // Get the middle point
      const middleCord = boardPoints.find((point) => {
        return (
          Math.abs(point.x - middleLine.x) < tolerance &&
          Math.abs(point.y - middleLine.y) < tolerance
        );
      });

      const isGoatInMiddle = args.renderedGoats.find((goat) => {
        return goat.cord == middleCord?.point;
      });

      // Get the index of killed goat
      if (isGoatInMiddle) {
        const killedGoat = args.renderedGoats.findIndex((goat) => {
          return goat.cord == isGoatInMiddle.cord;
        });

        return { valid: true, goatKilled: killedGoat };
      }
    }
  }

  // To handle exception cases
  if (
    (from == 11 && to == 13) ||
    (from == 11 && to == 31) ||
    (from == 31 && to == 51) ||
    (from == 51 && to == 31)
  )
    return { valid: false, goatKilled: undefined };

  // Check in predefined valid moves for diagonal paths
  const isValid = diagonalValidMoves.find((move) => {
    return (
      (move.from == from && move.to == to) ||
      (move.from == to && move.to == from)
    );
  });
  if (isValid) return { valid: true };

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

  if (isInGridLine) return { valid: true };
  return { valid: false };
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

const chopLine = (
  line: Line,
  segmentSize: number,
  tolerance: number = 50
): Line[] => {
  const { from, to } = line;

  // Calculate the differences in x and y coordinates
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  // Calculate the diagonal length (the hypotenuse in this case)
  const diagonalLength = Math.sqrt(dx * dx + dy * dy);

  // Handle the case where the line length is 0
  if (diagonalLength === 0) {
    return [{ from, to }];
  }

  // Calculate the number of full segments based on the diagonal length
  const numSegments = Math.floor(diagonalLength / segmentSize);

  // Calculate the remaining distance after full segments
  const remainingDistance = diagonalLength - numSegments * segmentSize;

  const segments: Line[] = [];

  // Create full segments
  for (let i = 0; i < numSegments; i++) {
    const start = {
      x: from.x + (dx / diagonalLength) * segmentSize * i,
      y: from.y + (dy / diagonalLength) * segmentSize * i,
    };
    const end = {
      x: from.x + (dx / diagonalLength) * segmentSize * (i + 1),
      y: from.y + (dy / diagonalLength) * segmentSize * (i + 1),
    };
    segments.push({ from: start, to: end });
  }

  // Handle the last segment, ensuring no extra segment is created
  if (remainingDistance > tolerance) {
    const start = {
      x: from.x + (dx / diagonalLength) * segmentSize * numSegments,
      y: from.y + (dy / diagonalLength) * segmentSize * numSegments,
    };
    const end = to; // Ensure the last segment ends exactly at 'to'
    segments.push({ from: start, to: end });
  }
  // console.log(segments);
  return segments;
};

const chopLineCustom = (line: Line, segmentSize: number) => {
  // console.log(line, segmentSize);

  const segments: Line[] = [];

  const dx = line.to.x - line.from.x; // Get the absolute difference in x
  const dy = line.to.y - line.from.y; // Get the absolute difference in y

  // check if it is a diagonal line
  if (isDiagonalLine(line)) {
    const noOfSegments = Math.floor(Math.abs(dx) / segmentSize);
    for (let i = 0; i < noOfSegments; i++) {
      const start = {
        x: line.from.x + (dx / Math.abs(dx)) * segmentSize * i,
        y: line.from.y + (dy / Math.abs(dy)) * segmentSize * i,
      };

      const end = {
        x: line.from.x + (dx / Math.abs(dx)) * segmentSize * (i + 1),
        y: line.from.y + (dy / Math.abs(dy)) * segmentSize * (i + 1),
      };

      segments.push({ from: start, to: end });
    }

    return segments;
  } else if (isHorizontalLine(line)) {
    const noOfSegments = Math.floor(Math.abs(dx) / segmentSize);
    console.log(noOfSegments);

    for (let i = 0; i < noOfSegments; i++) {
      const start = {
        x: line.from.x + (dx / Math.abs(dx)) * segmentSize * i,
        y: line.from.y,
      };

      const end = {
        x: line.from.x + (dx / Math.abs(dx)) * segmentSize * (i + 1),
        y: line.from.y,
      };

      segments.push({ from: start, to: end });
    }

    return segments;
  } else {
    const noOfSegments = Math.floor(Math.abs(dy) / segmentSize);
    console.log(noOfSegments);

    for (let i = 0; i < noOfSegments; i++) {
      const start = {
        x: line.from.x,
        y: line.from.y + (dy / Math.abs(dy)) * segmentSize * i,
      };

      const end = {
        x: line.from.x,
        y: line.from.y + (dy / Math.abs(dy)) * segmentSize * (i + 1),
      };

      segments.push({ from: start, to: end });
    }

    return segments;
  }
};

const isDiagonalLine = (line: Line) => {
  if (line.from.x === line.to.x || line.from.y === line.to.y) {
    return false;
  }
  return true;
};

const isHorizontalLine = (line: Line) => {
  if (line.from.y === line.to.y) {
    return true;
  }
  return false;
};
