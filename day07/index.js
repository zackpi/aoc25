let raw = await Bun.file("day07/input").text();
let lines = raw.split("\n");

// dedupe beams at each level
let splits = 0;
let beams = new Set([lines[0].indexOf("S")]);
for (let y = 2; y < lines.length-1; y += 2) {
  let newBeams = new Set();
  for (let x of beams) {
    if (lines[y].at(x) === "^") {
      splits++;
      newBeams.add(x-1);
      newBeams.add(x+1);
    } else {
      newBeams.add(x);
    }
  }
  beams = newBeams;
}

let part1 = splits;
console.log("part1 =", part1);
// =1662

// count each independent path
let memo = {};
let timeline = (x, y) => {
  let key = `${x},${y}`;
  if (key in memo) {
    return memo[key];
  }

  let result = timelineInner(x, y);
  memo[key] = result;
  return result;
}

let timelineInner = (x, y) => {
  if (y >= lines.length-1) {
    return 0;
  } else if (lines[y+1].at(x) === "^") {
    return timeline(x-1, y+2) + timeline(x+1, y+2) + 1
  } else {
    return timeline(x, y+2);
  }
}

let part2 = 1 + timeline(lines[0].indexOf("S"), 1);
console.log("part2 =", part2);
// =40941112789504
