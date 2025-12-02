let raw = await Bun.file("day02/input").text();
let ranges = raw.split(",").map((l) => l.split("-"));

let sumInvalid = (fn) => {
  let sum = 0;
  for (let range of ranges) {
    let start = parseInt(range[0]);
    let end = parseInt(range[1]);
    for (let id = start; id <= end; id++) {
      if (fn(id.toString())) {
        sum += id;
      }
    }
  }
  return sum;
}

let isInvalidPart1 = (id) => {
  if (id[0] === 0) return true;
  let hl = Math.ceil(id.length / 2);
  if (id.slice(0, hl) === id.slice(hl)) {
    return true;
  }
  return false;
}

let part1 = sumInvalid(isInvalidPart1);
console.log("part1 =", part1);
// =38437576669

let isInvalidPart2 = (id) => {
  if (id[0] === 0) return true;

  let len = id.length;
  if (len > 1) {
    let hl = Math.ceil(len / 2);
    for (let i = 1; i <= hl; i++) {
      let seq = id.slice(0, i);
      let repeated = seq.repeat(Math.ceil(len / i));
      if (repeated === id) {
        return true;
      }
    }
  }

  return false;
}

let part2 = sumInvalid(isInvalidPart2);
console.log("part2 =", part2);
// =49046150754
