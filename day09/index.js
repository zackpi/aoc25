let raw = await Bun.file("day09/input").text();
let coord = raw.split("\n").map(line => line.split(",").map(Number));

const POSY = 0; // +y
const POSX = 1; // +x
const NEGY = 2; // -y
const NEGX = 3; // -x

let padPolygon = (polygon) => {
  let padded = [];
  let len = polygon.length;
  let prevDir = POSX;
  let i0 = len - 1;
  let j0 = len - 2;
  let [x0, y0] = polygon[j0];
  let [x1, y1] = polygon[i0];
  if (x1 === x0) {
    // vertical edge
    if (y1 > y0) {
      prevDir = POSY;
    } else {
      prevDir = NEGY;
    }
  } else if (y1 === y0) {
    // horizontal edge
    if (x1 > x0) {
      prevDir = POSX;
    } else {
      prevDir = NEGX;
    }
  } else {
    throw new Error("non-axis-aligned edge");
  }

  for (let i = 0, j = len - 1; i < len; i++) {
    let [x0, y0] = polygon[j];
    let [x1, y1] = polygon[i];

    if (x0 === x1) {
      // vertical edge
      if (y1 > y0) {
        // going to positive y
        if (prevDir === NEGX) {
          padded.push([x0 + 1, y0 + 1]);
        } else if (prevDir === POSX) {
          padded.push([x0 + 1, y0 - 1]);
        } else { // prevDir === POSY
          padded.push([x0 + 1, y0]);
        }
        prevDir = POSY;
      } else {
        // going to negative y
        if (prevDir === POSX) {
          padded.push([x0 - 1, y0 - 1]);
        } else if (prevDir === NEGX) {
          padded.push([x0 - 1, y0 + 1]);
        } else { // prevDir === NEGY
          padded.push([x0 - 1, y0]);
        }
        prevDir = NEGY;
      }
    } else if (y0 === y1) {
      // horizontal edge
      if (x1 > x0) {
        // going to positive x
        if (prevDir === POSY) {
          padded.push([x0 + 1, y0 - 1]);
        } else if (prevDir === NEGY) {
          padded.push([x0 - 1, y0 - 1]);
        } else { // prevDir === POSX
          padded.push([x0, y0 - 1]);
        }
        prevDir = POSX;
      } else {
        // going to negative x
        if (prevDir === NEGY) {
          padded.push([x0 - 1, y0 + 1]);
        } else if (prevDir === POSY) {
          padded.push([x0 + 1, y0 + 1]);
        } else { // prevDir === NEGX
          padded.push([x0, y0 + 1]);
        }
        prevDir = NEGX;
      }
    } else {
      throw new Error("non-axis-aligned edge");
    }

    j = i;
  }

  return padded;
}

let horizontalIntersectsPolygon = (y, x0, x1, polygon) => {
  let len = polygon.length;
  for (let i = 0, j = len - 1; i < len; i++) {
    let [px0, py0] = polygon[j];
    let [px1, py1] = polygon[i];

    let bothAbove = py0 > y && py1 > y;
    let bothBelow = py0 < y && py1 < y;
    let horizontal = py0 === py1;
    if (bothAbove || bothBelow || horizontal) {
      j = i;
      continue;
    }

    let slope = (px1 - px0) / (py1 - py0);
    let intersectX = px0 + slope * (y - py0);
    if (intersectX >= x0 && intersectX <= x1) return true;
    
    j = i;
  }
  return false;
}

let verticalIntersectsPolygon = (x, y0, y1, polygon) => {
  let len = polygon.length;
  for (let i = 0, j = len - 1; i < len; i++) {
    let [px0, py0] = polygon[j];
    let [px1, py1] = polygon[i];

    let bothLeft = px0 < x && px1 < x;
    let bothRight = px0 > x && px1 > x;
    let vertical = px0 === px1;
    if (bothLeft || bothRight || vertical) {
      j = i;
      continue;
    }

    let slope = (py1 - py0) / (px1 - px0);
    let intersectY = py0 + slope * (x - px0);
    if (intersectY >= y0 && intersectY <= y1) return true;
    
    j = i;
  }
  return false;
}

let polygonContainsRect = (polygon, rect) => {
  let [rx0, ry0, rx1, ry1] = rect;
  return !horizontalIntersectsPolygon(ry0, rx0, rx1, polygon) &&
         !horizontalIntersectsPolygon(ry1, rx0, rx1, polygon) &&
         !verticalIntersectsPolygon(rx0, ry0, ry1, polygon) &&
         !verticalIntersectsPolygon(rx1, ry0, ry1, polygon);
}

let maxConstrainedArea = 0;
let maxUnconstrainedArea = 0;
let paddedPolygon = padPolygon(coord);
for (let i = 0; i < coord.length; i++) {
  for (let j = 0; j < coord.length; j++) {
    if (i === j) continue;
    let [cx0, cy0] = coord[i];
    let [cx1, cy1] = coord[j];
    let area = (Math.abs(cx0 - cx1) + 1) * (Math.abs(cy0 - cy1) + 1);

    let x0 = Math.min(cx0, cx1);
    let y0 = Math.min(cy0, cy1);
    let x1 = Math.max(cx0, cx1);
    let y1 = Math.max(cy0, cy1);

    if (polygonContainsRect(paddedPolygon, [x0, y0, x1, y1])) {
      maxConstrainedArea = Math.max(maxConstrainedArea, area);
    }

    maxUnconstrainedArea = Math.max(maxUnconstrainedArea, area);
  }
}

let part1 = maxUnconstrainedArea;
console.log("part1 =", part1);
// =4763932976

let part2 = maxConstrainedArea;
console.log("part2 =", part2);
// =1501292304
