let raw = await Bun.file("day04/input").text();
// let raw = await Bun.file("day04/input_small").text();
let grid = raw.split("\n").map(l => l.split(""));

let deltas = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

let countGrid = grid.map(row => row.map(_ => Infinity));
let freeList = [];
for (let r = 0; r < grid.length; r++) {
  for (let c = 0; c < grid[r].length; c++) {
    if (grid[r][c] === "@") {

      let count = 0;
      for (let [dr, dc] of deltas) {
        if (r + dr >= 0 && r + dr < grid.length && c + dc >= 0 && c + dc < grid[r].length) {
          if (grid[r + dr][c + dc] === "@") count++;
        }
      }
      countGrid[r][c] = count;
      if (count < 4) freeList.push([r, c]); 
      
    }
  }
}

let total = 0;
let rounds = [freeList.length];
while (freeList.length > 0) {
  let newFreeList = [];
  for (let [r, c] of freeList) {
    if (grid[r][c] === "@") {
      grid[r][c] = ".";
      total++;

      for (let [dr, dc] of deltas) {
        if (r + dr >= 0 && r + dr < grid.length && c + dc >= 0 && c + dc < grid[r].length) {
          if (grid[r + dr][c + dc] === "@") {
            countGrid[r + dr][c + dc]--;
            if (countGrid[r + dr][c + dc] === 3) {
              newFreeList.push([r + dr, c + dc]);
            }
          }
        }
      }
    }
  }
  rounds.push(newFreeList.length);
  freeList = newFreeList;
}


let part1 = rounds[0];
console.log("part1 =", part1);
// =1395

let part2 = rounds.reduce((a, b) => a + b, 0);
console.log("part2 =", part2);
// =8451
