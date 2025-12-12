// let raw = await Bun.file("day12/input_small").text();
let raw = await Bun.file("day12/input").text();


// orientations are:
// - rotations of 0, 90, 180, or 270 degrees are allowed
// - flips are allowed
function orientationKey(rotation, flip) {
  return `r${rotation}_f${flip ? 1 : 0}`;
}

function orientationFromKey(key) {
  let [rPart, fPart] = key.split("_");
  let rotation = parseInt(rPart.slice(1), 10);
  let flip = fPart.slice(1) === "1";
  return { rotation, flip };
}

function generateOrientations(shape) {
  let orientations = {};

  let rotateShape = (shape) => {
    let newShape = Array(3).fill(0).map(() => Array(3).fill("."));
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        newShape[x][2 - y] = shape[y][x];
      }
    }
    return newShape;
  };

  let flipShape = (shape) => {
    let newShape = Array(3).fill(0).map(() => Array(3).fill("."));
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        newShape[y][2 - x] = shape[y][x];
      }
    }
    return newShape;
  };

  for (let rotation of [0, 90, 180, 270]) {
    let rotatedShape = shape;
    for (let r = 0; r < rotation; r += 90) {
      rotatedShape = rotateShape(rotatedShape);
    }

    for (let flip of [false, true]) {
      let finalShape = rotatedShape;
      if (flip) {
        finalShape = flipShape(finalShape);
      }
      let key = orientationKey(rotation, flip);
      orientations[key] = finalShape;
    }
  }

  return orientations;
}

// parse input
let endOfShapes = raw.lastIndexOf("\n\n");
let shapes = raw.slice(0, endOfShapes).split("\n\n").map((shapeStr) => {
  let [keyColon, ...rawShape] = shapeStr.split("\n");
  let name = keyColon.slice(0, -1);
  let shape = rawShape.map(line => line.split(""));
  let orientations = generateOrientations(shape);
  return { name, shape, orientations };
});
let regions = raw
  .slice(endOfShapes)
  .trim()
  .split("\n")
  .map((line) => {
    let [sizeStr, countStr] = line.split(": ")
    let size = sizeStr.split("x").map(Number);
    let counts = countStr.split(" ").map(Number);
    return { size, counts };
  });

let readPossibleTxt = async () => {
  try {
    let raw = await Bun.file("day12/possible.txt").text();
    return JSON.parse(raw);
    // return Object.fromEntries(
    //   raw
    //     .trim()
    //     .split("\n")
    //     .map(line => {
    //       let [iStr, bStr] = line.split(": ");
    //       let i = parseInt(iStr, 10);
    //       let b = bStr === "1";
    //       return [i, b];
    //     })
    // );
  } catch (e) {
    return {};
  }
}

let updatePossibleTxt = async (i, bool) => {
  let regions = await readPossibleTxt();
  regions[i] = bool;
  // let outStr = regions.map((b, i) => `${i}: ${b ? "1" : "0"}`).join("\n");
  let outStr = JSON.stringify(regions, null, 2);
  await Bun.write("day12/possible.txt", outStr);
}

let printShape = (shape, pad = 0) => {
  console.log(shape.map(s => s.join("").padStart(pad)).join("\n"));
}

let initGrid = (width, height) => {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => [".", false]));
}

let printGrid = (grid) => {
  console.log(grid.map(row => row.map(r => r[0]).join("")).join("\n"));
}

let canPlaceSingleShapeAt = (grid, shape, posX, posY) => {
  let coverage = 0;
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      let boardX = posX + x;
      let boardY = posY + y;
      if (boardX < 0 || boardX >= grid[0].length || boardY < 0 || boardY >= grid.length) {
        return [false, Infinity];
      }

      if (shape[y][x] === "#") {
        let [cell, occupancy] = grid[boardY][boardX];
        if (cell === ".") {
          if (occupancy) {
            // "covers" the dead zone of another shape
            coverage += 1;
          }
        } else {
          // overlap with existing shape
          return [false, Infinity];
        }
      }
    }
  }
  return [true, coverage];
}

let placeSingleShapeAt = (grid, shape, posX, posY, chr) => {
  let char = String.fromCharCode(65 + (chr % 26));

  let newGrid = grid.map(row => row.map(cell => cell.slice()));
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      let boardX = posX + x;
      let boardY = posY + y;

      if (shape[y][x] === "#") {
        newGrid[boardY][boardX] = [char, true];
      } else {
        // mark dead zone
        newGrid[boardY][boardX][1] = true;
      }
    }
  }
  return newGrid;
}

let bruteCanPlaceRemaining = (grid, remaining, timeout, chr=0) => {
  if (timeout && performance.now() > timeout) {
    throw new Error("aborted");
  }

  // console.log(" ")
  // console.log("bruteCanPlaceRemaining called with remaining =", remaining);
  // printGrid(grid);
  if (remaining.every(c => c <= 0)) {
    printGrid(grid);
    return true;
  }

  let validPlacements = [];

  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i] <= 0) {
      continue;
    }


    for (let orientedShape of Object.values(shapes[i].orientations)) {
      for (let y = 0; y < grid.length - 2; y++) {
        for (let x = 0; x < grid[0].length - 2; x++) {
          let [canPlace, coverage] = canPlaceSingleShapeAt(grid, orientedShape, x, y);
          if (canPlace) {
            validPlacements.push({ i, orientedShape, x, y, coverage });
          }
        }
      }
    }
  }

  validPlacements.sort((a, b) => a.coverage - b.coverage);
  for (let { i, orientedShape, x, y } of validPlacements) {

    let newGrid = placeSingleShapeAt(grid, orientedShape, x, y, chr);
    let newRemaining = remaining.slice();
    newRemaining[i] -= 1;
    if (bruteCanPlaceRemaining(newGrid, newRemaining, timeout, chr + 1)) {
      return true;
    }
  }

  return false;
}

// ----------------------------------------

// find trivial cases

let triviallyPossible = 0;
for (let regionIndex = 0; regionIndex < regions.length; regionIndex++) {
  let { size, counts } = regions[regionIndex];
  // console.log("size =", size, "counts =", counts);

  let minShapeArea = 0;
  for (let i = 0; i < counts.length; i++) {
    minShapeArea += 9 * counts[i];
  }
  
  let maxArea = size[0] * size[1];

  if (minShapeArea <= maxArea) {
    triviallyPossible += 1;

    // await updatePossibleTxt(regionIndex, true);
    continue;
  }
}

// ----------------------------------------


const regionsPossible = await readPossibleTxt();

let total = 0;
for (let regionIndex = 0; regionIndex < regions.length; regionIndex++) {
  let regionPossible = regionsPossible[regionIndex];
  if (regionPossible !== undefined) {
    if (regionPossible === true) {
      total += 1;
    }
    
    continue;
  }

  let { size, counts } = regions[regionIndex];
  console.log("checking region size", size, "counts", counts);

  console.log("  starting timeout for region", regionIndex);
  let timeout = performance.now() + 1_000;

  try {
    let placed = bruteCanPlaceRemaining(initGrid(size[0], size[1]), counts.slice(), timeout, 0);
    if (placed) {
      console.log("> can place shapes");
      total += 1;
    } else {
      console.log("> cannot place shapes");
    }
    await updatePossibleTxt(regionIndex, placed);
  } catch (e) {
    if (e.message === "aborted") {
      console.log("> aborted solving region", regionIndex);
      await updatePossibleTxt(regionIndex, null); // unknown because aborted
    } else {
      throw e;
    }
  }
}

// ----------------------------------------


let part1 = total;
console.log("part1 =", part1);
// =472

let part2 = 0;
console.log("part2 =", part2);
// =
