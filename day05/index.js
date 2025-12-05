// let raw = await Bun.file("day05/input_small").text();
let raw = await Bun.file("day05/input").text();
let lines = raw.split("\n");
let blank = lines.indexOf("");
let ranges = lines.slice(0, blank).map(l => {
  let [min, max] = l.split("-").map(Number);
  return [min, max];
});
let ids = lines.slice(blank + 1).map(Number);

let count = 0;
for (let id of ids) {
  for (let [min, max] of ranges) {
    if (id >= min && id <= max) {
      count++;
      break;
    }
  }
}

let part1 = count;
console.log("part1 =", part1);
// =567

ranges.sort((a, b) => a[0] - b[0]);
let u = [];
for (let [rangeMin, rangeMax] of ranges) {
  if (u.length === 0) {
    u.push([rangeMin, rangeMax]);
    continue;
  }

  let [lastMin, lastMax] = u[u.length - 1];
  if (rangeMin <= lastMax) {
    // overlap
    u[u.length - 1] = [lastMin, Math.max(lastMax, rangeMax)];
  } else {
    u.push([rangeMin, rangeMax]);
  }
}

let part2 = 0;
for (let [min, max] of union) {
  part2 += (max - min + 1);
}

console.log("part2 =", part2);
// =354149806372909
