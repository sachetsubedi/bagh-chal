export const generateGridPoints = () => {
  const gridLines: {
    from: { x: number; y: number };
    to: { x: number; y: number };
  }[] = [];

  const startPoint = 0;
  const endPoint = 500;

  // Calculate the step size
  const step = (endPoint - startPoint) / 5;

  console.log(step);

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

  console.log(gridLines);
};
