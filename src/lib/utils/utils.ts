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

  // Add horizontal lines
  for (let i = 0; i <= gridsize; i++) {
    const y = topLeft.y + i * step;
    gridLines.push({
      from: { x: topLeft.x, y },
      to: { x: bottomRight.x, y },
    });
  }

  // Add vertical lines
  for (let i = 0; i <= gridsize; i++) {
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
    boardSize = screenHeight * 0.75;
  } else {
    // If width is less than height, set the board size to 80% of the width
    boardSize = screenWidth * 0.75;
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
}): { valid: boolean; goatKilled?: string } => {
  const { from, to, gridLines, boardPoints, step } = args;

  // Firstly check if the mover is tiger and check if there is a kill
  if (args.character === "tiger") {
    const startCords = boardPoints.find((point) => {
      return point.point == from;
    });
    const endCords = boardPoints.find((point) => {
      return point.point == to;
    });

    const choppedPath = chopLineCustom(
      {
        from: { x: startCords?.x ?? 0, y: startCords?.y ?? 0 },
        to: { x: endCords?.x ?? 0, y: endCords?.y ?? 0 },
      },
      step
    );

    const isInALine = isMoveInALine({
      from: { x: startCords?.x ?? 0, y: startCords?.y ?? 0 },
      to: { x: endCords?.x ?? 0, y: endCords?.y ?? 0 },
    });

    if (!isInALine) return { valid: false };

    if (choppedPath.length === 2) {
      // means there is a point gap between the two cords
      // check if there is a goat in the middle

      // verify that the chopped path exits in the rendered lines
      let isChoppedPathsValid = true;

      const epsilon = 50; // Define a tolerance value

      choppedPath.forEach((path) => {
        let exists = false;
        gridLines.forEach((line) => {
          if (
            (Math.abs(line.from.x - path.from.x) <= epsilon &&
              Math.abs(line.from.y - path.from.y) <= epsilon &&
              Math.abs(line.to.x - path.to.x) <= epsilon &&
              Math.abs(line.to.y - path.to.y) <= epsilon) ||
            (Math.abs(line.from.x - path.to.x) <= epsilon &&
              Math.abs(line.from.y - path.to.y) <= epsilon &&
              Math.abs(line.to.x - path.from.x) <= epsilon &&
              Math.abs(line.to.y - path.from.y) <= epsilon)
          ) {
            exists = true;
          }
        });
        if (!exists) isChoppedPathsValid = false;
      });

      if (!isChoppedPathsValid) return { valid: false };

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

        return { valid: true, goatKilled: killedGoat.toString() };
      }
    }
  }

  // // To handle exception cases
  // if (
  //   (from == 11 && to == 13) ||
  //   (from == 11 && to == 31) ||
  //   (from == 31 && to == 51) ||
  //   (from == 51 && to == 31)
  // )
  //   return { valid: false, goatKilled: undefined };

  // // Check in predefined valid moves for diagonal paths
  // const isValid = diagonalValidMoves.find((move) => {
  //   return (
  //     (move.from == from && move.to == to) ||
  //     (move.from == to && move.to == from)
  //   );
  // });
  // if (isValid) return { valid: true };

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
    choppedLines.push(...chopLineCustom(line, segmentSize));
  });

  return choppedLines;
};

const chopLineCustom = (line: Line, segmentSize: number): Line[] => {
  const segments: Line[] = [];
  const dx = line.to.x - line.from.x;
  const dy = line.to.y - line.from.y;

  const isDiagonal = isDiagonalLine(line);
  const isHorizontal = isHorizontalLine(line);
  const isVertical = !isHorizontal && !isDiagonal;

  if (isDiagonal) {
    const steps = Math.floor(Math.abs(dx) / segmentSize);
    const stepX = (dx / Math.abs(dx)) * segmentSize; // Increment in x for each segment
    const stepY = (dy / Math.abs(dy)) * segmentSize; // Increment in y for each segment

    for (let i = 0; i < steps; i++) {
      const start = {
        x: line.from.x + stepX * i,
        y: line.from.y + stepY * i,
      };
      const end = {
        x: line.from.x + stepX * (i + 1),
        y: line.from.y + stepY * (i + 1),
      };
      segments.push({ from: start, to: end });
    }

    // Add the remaining portion if it doesn't fit evenly
    if (steps * segmentSize < Math.abs(dx)) {
      segments.push({
        from: {
          x: line.from.x + stepX * steps,
          y: line.from.y + stepY * steps,
        },
        to: { ...line.to },
      });
    }
  } else if (isHorizontal) {
    const steps = Math.floor(Math.abs(dx) / segmentSize);
    const stepX = (dx / Math.abs(dx)) * segmentSize;

    for (let i = 0; i < steps; i++) {
      const start = { x: line.from.x + stepX * i, y: line.from.y };
      const end = { x: line.from.x + stepX * (i + 1), y: line.from.y };
      segments.push({ from: start, to: end });
    }

    // Add the remaining portion if it doesn't fit evenly
    if (steps * segmentSize < Math.abs(dx)) {
      segments.push({
        from: { x: line.from.x + stepX * steps, y: line.from.y },
        to: { ...line.to },
      });
    }
  } else if (isVertical) {
    const steps = Math.floor(Math.abs(dy) / segmentSize);
    const stepY = (dy / Math.abs(dy)) * segmentSize;

    for (let i = 0; i < steps; i++) {
      const start = { x: line.from.x, y: line.from.y + stepY * i };
      const end = { x: line.from.x, y: line.from.y + stepY * (i + 1) };
      segments.push({ from: start, to: end });
    }

    // Add the remaining portion if it doesn't fit evenly
    if (steps * segmentSize < Math.abs(dy)) {
      segments.push({
        from: { x: line.from.x, y: line.from.y + stepY * steps },
        to: { ...line.to },
      });
    }
  }

  return segments;
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

const isMoveInALine = (line: Line) => {
  const dx = Math.abs(line.to.x - line.from.x);
  const dy = Math.abs(line.to.y - line.from.y);

  if (dx == 0 || dy == 0) return true;

  if (Math.abs(dx - dy) < 2) return true;

  return false;
};

export const isTigerTrapped = (args: {
  tigerCord: number;
  renderedGoats: { cord?: number; x?: number; y?: number }[];
  boardPoints: { point: T_BoardPoints; x: number; y: number }[];
  gridLines: T_GridLines;
  renderedTigers: { cord?: number; x?: number; y?: number }[];
}) => {
  const { tigerCord } = args;

  const directions = [
    { x: -1, y: 0 }, // Up
    { x: 1, y: 0 }, // Down
    { x: 0, y: -1 }, // Left
    { x: 0, y: 1 }, // Right
    { x: -1, y: -1 }, // Top-left (Diagonal)
    { x: -1, y: 1 }, // Top-right (Diagonal)
    { x: 1, y: -1 }, // Bottom-left (Diagonal)
    { x: 1, y: 1 }, // Bottom-right (Diagonal)
  ];
  let splittedCords: string[] = [];

  try {
    splittedCords = tigerCord.toString().split("");
  } catch (e) {
    console.log("In transition", e);
  }
  if (!splittedCords) return;

  const tigerCoords = {
    x: parseInt(splittedCords[0]),
    y: parseInt(splittedCords[1]),
  };

  const pointsToSearch = directions.map((dir) => {
    const cordToSearch = {
      x: tigerCoords.x + dir.x,
      y: tigerCoords.y + dir.y,
    };

    if (
      cordToSearch.x < 1 ||
      cordToSearch.y < 1 ||
      cordToSearch.x > 5 ||
      cordToSearch.y > 5
    ) {
      return null;
    }

    return cordToSearch;
  });

  // Filter oput teh null values
  const filteredPointsToSearch = pointsToSearch.filter((point) => {
    return point !== null;
  });

  // Join the points to search (x and y) to a single number as the globally used cords
  const joinedPointsToSearched = filteredPointsToSearch.map((points) => {
    return Number(points.x.toString() + points.y.toString());
  });

  // Define a tolerance value
  const epsilon = 2;

  // Convert grid lines to and from cords with tolerance
  const gridLinesCords = args.gridLines.map((line) => {
    const fromCord = args.boardPoints.find((point) => {
      return (
        Math.abs(point.x - line.from.x) <= epsilon &&
        Math.abs(point.y - line.from.y) <= epsilon
      );
    });

    const toCord = args.boardPoints.find((point) => {
      return (
        Math.abs(point.x - line.to.x) <= epsilon &&
        Math.abs(point.y - line.to.y) <= epsilon
      );
    });

    return { from: fromCord?.point as number, to: toCord?.point as number };
  });

  const tigerHasAValidKill = tigerHasAValidKillMove(
    tigerCord,
    args.renderedGoats,
    gridLinesCords,
    args.renderedTigers
  );

  if (tigerHasAValidKill) {
    console.log("Tiger has a valid kill move", tigerCord);
    return false;
  }

  // search for all points to search and filter ouyt the invalid moves
  // this is actual points to search if it is ocupied or not 😮‍💨
  const validPointsToSearch = joinedPointsToSearched.filter((point) => {
    return gridLinesCords.find((line) => {
      return (
        (line.from === tigerCord && line.to === point) ||
        (line.from === point && line.to === tigerCord)
      );
    });
  });

  let hasFreeMove: boolean = false;

  // Now search all the points to search if they are occupied by goats or tigers
  validPointsToSearch.forEach((point) => {
    const isGoat = args.renderedGoats.find((goat) => {
      return goat.cord === point;
    });

    if (!isGoat) {
      // If there is no goat, check if there is a tiger in that place
      const isTiger = args.renderedTigers.find((tiger) => {
        return tiger.cord === point;
      });

      if (!isTiger) hasFreeMove = true;
    }
  });

  return !hasFreeMove;
};

const tigerHasAValidKillMove = (
  tigerCord: number,
  renderedGoats: { cord?: number; x?: number; y?: number }[],
  gridLineCords: { from: number; to: number }[],
  renderedTigers: { cord?: number; x?: number; y?: number }[]
) => {
  const directions = [
    { x: -1, y: 0 }, // Up
    { x: 1, y: 0 }, // Down
    { x: 0, y: -1 }, // Left
    { x: 0, y: 1 }, // Right
    { x: -1, y: -1 }, // Top-left (Diagonal)
    { x: -1, y: 1 }, // Top-right (Diagonal)
    { x: 1, y: -1 }, // Bottom-left (Diagonal)
    { x: 1, y: 1 }, // Bottom-right (Diagonal)
  ];

  const secondStepDirections = [
    { x: -2, y: 0 }, // Up
    { x: 2, y: 0 }, // Down
    { x: 0, y: -2 }, // Left
    { x: 0, y: 2 }, // Right
    { x: -2, y: -2 }, // Top-left (Diagonal)
    { x: -2, y: 2 }, // Top-right (Diagonal)
    { x: 2, y: -2 }, // Bottom-left (Diagonal)
    { x: 2, y: 2 }, // Bottom-right (Diagonal)
  ];

  let splittedCords: string[] = [];

  try {
    splittedCords = tigerCord.toString().split("");
  } catch (e) {
    console.log("In transition", e);
  }

  if (!splittedCords) return;

  const tigerCoords = {
    x: parseInt(splittedCords[0]),
    y: parseInt(splittedCords[1]),
  };

  // const blackSpaces = [];

  const firstPointsToSearchV0 = directions.map((dir) => {
    const cordToSearch = {
      x: tigerCoords.x + dir.x,
      y: tigerCoords.y + dir.y,
    };

    return cordToSearch;
  });

  const secondPointsToSearchV0 = secondStepDirections.map((dir) => {
    const cordToSearch = {
      x: tigerCoords.x + dir.x,
      y: tigerCoords.y + dir.y,
    };

    return cordToSearch;
  });

  // Check if the first point to search are in the grid lines
  const invalidIndexesV0: number[] = [];

  firstPointsToSearchV0.forEach((point, idx) => {
    if (point.x < 1 || point.y < 1 || point.x > 5 || point.y > 5) {
      return invalidIndexesV0.push(idx);
    }

    // Check the move is in the grid lines
    const isInGridLine = gridLineCords.find((line) => {
      return (
        (line.from === tigerCord &&
          line.to === Number(point.x.toString() + point.y.toString())) ||
        (line.from === Number(point.x.toString() + point.y.toString()) &&
          line.to === tigerCord)
      );
    });

    if (!isInGridLine) invalidIndexesV0.push(idx);
  });

  const firstPointsToSearch = firstPointsToSearchV0.filter((_, idx) => {
    return !invalidIndexesV0.includes(idx);
  });

  const secondPointsToSearch = secondPointsToSearchV0.filter((_, idx) => {
    return !invalidIndexesV0.includes(idx);
  });

  const invalidIndexes: number[] = [];

  //  get the indxes of the second points to search which are invalid, to remove them from the first points to search
  secondPointsToSearch.forEach((point, idx) => {
    if (point.x < 1 || point.y < 1 || point.x > 5 || point.y > 5) {
      return invalidIndexes.push(idx);
    }

    // Check the move is in the grid lines
    const isInGridLine = gridLineCords.find((line) => {
      return (
        (line.from === tigerCord &&
          line.to === Number(point.x.toString() + point.y.toString())) ||
        (line.from === Number(point.x.toString() + point.y.toString()) &&
          line.to === tigerCord)
      );
    });

    console.log(
      isInGridLine,
      tigerCord,
      Number(point.x.toString() + point.y.toString())
    );
    // console.log(gridLineCords);
    // console.log("Is in grid line", isInGridLine);
    // if (!isInGridLine) invalidIndexes.push(idx);
  });

  // Filter out the invalid indexes from both the first and second points to search
  const filteredFirstPointsToSearch = firstPointsToSearch.filter((_, idx) => {
    return !invalidIndexes.includes(idx);
  });

  const filteredSecondPointsToSearch = secondPointsToSearch.filter((_, idx) => {
    return !invalidIndexes.includes(idx);
  });

  // Check if the first and second point form a line and exist in the grid lines
  const invalidV2Indexes: number[] = [];

  filteredFirstPointsToSearch.forEach((point) => {
    const isInALine = isMoveInALine({
      from: { x: tigerCoords.x, y: tigerCoords.y },
      to: { x: point.x, y: point.y },
    });

    if (!isInALine)
      invalidV2Indexes.push(filteredSecondPointsToSearch.indexOf(point));
  });

  // i want to cry 😭

  let hasAValidKill: boolean = false;

  // Now check if the first cord has a goat and the second cord is empty
  filteredFirstPointsToSearch.forEach((point, idx) => {
    const isGoat = renderedGoats.find((goat) => {
      return goat.cord === Number(point.x.toString() + point.y.toString());
    });

    // If there is goast, check the second cord if it is empty
    if (isGoat) {
      const noGoat = renderedGoats.find((goat) => {
        return (
          goat.cord ===
          Number(
            filteredSecondPointsToSearch[idx].x.toString() +
              filteredSecondPointsToSearch[idx].y.toString()
          )
        );
      });

      const noTiger = renderedTigers.find((tiger) => {
        return (
          tiger.cord ==
          Number(
            filteredSecondPointsToSearch[idx].x.toString() +
              filteredSecondPointsToSearch[idx].y.toString()
          )
        );
      });

      if (!noGoat && !noTiger) hasAValidKill = true;
    }
  });

  return hasAValidKill;
};
