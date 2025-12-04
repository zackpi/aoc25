let raw = await Bun.file("day04/input").text();
let grid = raw.split("\n").map(l => l.split(""));

let deltas = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];
let neighbors = (r, c) => {
  return deltas
    .map(([dr, dc]) => [r + dr, c + dc])
    .filter(([nr, nc]) => 
      nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[nr].length
    );
}

let countGrid = grid.map(row => row.map(_ => Infinity));
let freeList = [];
for (let r = 0; r < grid.length; r++) {
  for (let c = 0; c < grid[r].length; c++) {
    if (grid[r][c] === "@") {

      let count = 0;
      for (let [nr, nc] of neighbors(r, c)) {
        if (grid[nr][nc] === "@") count++;
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

      for (let [nr, nc] of neighbors(r, c)) {
        if (grid[nr][nc] === "@") {
          countGrid[nr][nc]--;
          if (countGrid[nr][nc] === 3) {
            newFreeList.push([nr, nc]);
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
