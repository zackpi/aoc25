let raw = await Bun.file("day04/input").text();
// let raw = await Bun.file("day04/input_small").text();
let grid = raw.split("\n").map(l => l.split(""));

let remove = (grid) => {
  let countGrid = grid.map(row => row.map(_ => Infinity));

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === "@") {
        let deltas = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1],          [0, 1],
          [1, -1], [1, 0], [1, 1],
        ];
        let count = 0;
        for (let [dr, dc] of deltas) {
          let nr = r + dr;
          let nc = c + dc;
          if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[r].length) {
            if (grid[nr][nc] === "@") {
              count++;
            }
          }
        }
        countGrid[r][c] = count;
      }
    }
  }

  let total = 0;
  for (let r = 0; r < countGrid.length; r++) {
    for (let c = 0; c < countGrid[r].length; c++) {
      if (countGrid[r][c] < 4) {
        grid[r][c] = ".";
        total++;
      }
    }
  }

  return total;
}

let numRemoved = remove(grid);
let rounds = [numRemoved];
while (numRemoved > 0) {
  numRemoved = remove(grid);
  rounds.push(numRemoved);
}

let part1 = rounds[0];
console.log("part1 =", part1);
// =1395

let part2 = rounds.reduce((a, b) => a + b, 0);
console.log("part2 =", part2);
// =8451
