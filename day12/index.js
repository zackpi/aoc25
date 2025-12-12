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

let bruteCanPlaceRemaining = (grid, remaining, chr=0) => {
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
  // console.log("validPlacements (sorted by coverage):", validPlacements);

  // console.log(`found ${validPlacements.length} valid placements for shape index`, i);

  // let placed = 0;
  for (let { i, orientedShape, x, y } of validPlacements) {
    // console.log(`[${placed} / ${validPlacements.length}] trying placement of shape index ${i} at (${x}, ${y})`);
    // placed++

    let newGrid = placeSingleShapeAt(grid, orientedShape, x, y, chr);
    let newRemaining = remaining.slice();
    newRemaining[i] -= 1;
    if (bruteCanPlaceRemaining(newGrid, newRemaining, chr + 1)) {
      return true;
    }
  }

  // console.log("no placements possible for current grid and remaining =", remaining);

  return false;
}

const regionsPossible = await readPossibleTxt();

let total = 0;
for (let regionIndex = 0; regionIndex < regions.length; regionIndex++) {
  let alreadyKnownPossible = regionsPossible[regionIndex];
  if (alreadyKnownPossible !== undefined) {
    if (alreadyKnownPossible === true) {
      console.log(`region ${regionIndex} already known possible, skipping`);
      total += 1;
    } else {
      console.log(`region ${regionIndex} already known impossible, skipping`);
    }
    
    continue;
  }

  let { size, counts } = regions[regionIndex];
  console.log("checking region size", size, "counts", counts);
  if (bruteCanPlaceRemaining(initGrid(size[0], size[1]), counts.slice())) {
    console.log("> can place shapes");
    total += 1;
    await updatePossibleTxt(regionIndex, true);
  }
}
console.log("total =", total);


// let shapeGroups = {};
// for (let i = 0; i < shapes.length; i++) {
//   let shapeI = shapes[i];
//   printShape(shapeI.shape);
//   for (let j = i + 1; j < shapes.length; j++) {
//     let shapeJ = shapes[j];
//     printShape(shapeJ.shape, 4);

//     let combinations = [];
//     for (let dy = -2; dy <= +2; dy++) {
//       for (let dx = -2; dx <= +2; dx++) {
//         let overlap = false;
//         for (let y = 0; y < 3; y++) {
//           for (let x = 0; x < 3; x++) {
//             let yI = y;
//             let xI = x;
//             let yJ = y + dy;
//             let xJ = x + dx;
//             if (yJ < 0 || yJ >= 3 || xJ < 0 || xJ >= 3) {
//               continue;
//             }
//             if (shapeI.shape[yI][xI] === "#" && shapeJ.shape[yJ][xJ] === "#") {
//               overlap = true;
//             }
//           }
//         }
//         if (!overlap) {
//           combinations.push([dx, dy]);
//         }
//       }
//     }

//     console.log(`  combinations between ${shapeI.name} and ${shapeJ.name}:`, combinations);
//   }
// }


// console.log("shapes =", shapes);

// let totalPossible = 0;
// for (let { size, counts } of regions) {
//   // console.log("size =", size, "counts =", counts);

//   let maxArea = 0;
//   for (let i = 0; i < counts.length; i++) {
//     maxArea += 9 * counts[i];
//   }
  
//   let divX = (3 * Math.trunc(size[0] / 3));
//   let divY = (3 * Math.trunc(size[1] / 3));
//   let minArea = divX * divY;

//   if (maxArea < minArea) {
//     console.log("found trivial case:  minArea =", minArea, "maxArea =", maxArea);
//     totalPossible += 1;
//     continue;
//   }
// }

// console.log("totalPossible =", totalPossible);
// console.log("totalRegions =", regions.length);



// let totalPossible = 0;
// for (let { size, counts } of regions) {
//   // free space records the "trivially" free space not spanned by any 3x3 shape AABB
//   let freeSpace = Array(size[1]).fill(0).map(() => Array(size[0]).fill(true));
//   let board = Array(size[1]).fill(0).map(() => Array(size[0]).fill("."));

//   let canPlaceShapeAt = (shape, posX, posY) => {
//     let consumesSpace = 0;
//     for (let y = 0; y < 3; y++) {
//       for (let x = 0; x < 3; x++) {
//         let boardX = posX + x;
//         let boardY = posY + y;
//         if (boardX < 0 || boardX >= size[0] || boardY < 0 || boardY >= size[1]) {
//           return [false, 0];
//         }

//         if (shape[y][x] === "#") {
//           if (board[boardY][boardX] === "#") {
//             return [false, 0];
//           }
//         }
//         if (freeSpace[boardY][boardX]) {
//           consumesSpace += 1;
//         }
//       }
//     }
//     return [true, consumesSpace];
//   };
  
//   let placeShapeAt = (shape, posX, posY) => {
//     for (let y = 0; y < 3; y++) {
//       for (let x = 0; x < 3; x++) {
//         let boardX = posX + x;
//         let boardY = posY + y;

//         if (shape[y][x] === "#") {
//           board[boardY][boardX] = "#";
//         }

//         if (freeSpace[boardY][boardX]) {
//           freeSpace[boardY][boardX] = false;
//         }
//       }
//     }
//   };

//   let countsLeft = counts.slice();
//   while (true) {
//     let allUsedUp = countsLeft.every(c => c <= 0);
//     if (allUsedUp) {
//       console.log("found valid arrangement for region size", size, "counts", counts);
//       totalPossible += 1;
//       break;
//     }

//     let next = Math.trunc(Math.random() * shapes.length);
//     if (countsLeft[next] <= 0) {
//       continue;
//     }

//     let shape = shapes[next].shape;
//     let minConsumes = Infinity;
//     let minConsumesPos = null;
//     for (let y = 0; y < size[1]; y++) {
//       for (let x = 0; x < size[0]; x++) {
//         let [canPlace, consumesSpace] = canPlaceShapeAt(shape, x, y);
//         if (canPlace) {
//           if (consumesSpace < minConsumes) {
//             minConsumes = consumesSpace;
//             minConsumesPos = [x, y];
//           }
//         }
//       }
//     }

//     if (minConsumesPos) {
//       placeShapeAt(shape, minConsumesPos[0], minConsumesPos[1]);
//       countsLeft[next] -= 1;
//     } else {
//       console.log("stuck with region size", size, "counts", counts, "countsLeft", countsLeft);
//       break;
//     }
//   }

// }


let part1 = 0;
console.log("part1 =", part1);
// =

let part2 = 0;
console.log("part2 =", part2);
// =
