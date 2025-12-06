let raw = await Bun.file("day06/input").text();
let lines = raw.split("\n");
let rows = lines.slice(0, -1);

let ops = [...lines.at(-1).matchAll(/[\+\*]/g)];
let problems = ops.map((m, i) => {
  let start = m.index;
  let end = i + 1 < ops.length ? ops[i + 1].index-1 : lines.at(-1).length;
  return [m[0], rows.map(r => r.slice(start, end))];
});

let compute = (op, args) => {
  if (op === '+') {
    return args.reduce((acc, arg) => acc + Number(arg), 0);
  } else if (op === '*') {
    return args.reduce((acc, arg) => acc * Number(arg), 1);
  }
}

let part1 = 0;
for (let [op, args] of problems) {
  part1 += compute(op, args);
}
console.log("part1 =", part1);
// =4771265398012

let part2 = 0;
for (let [op, args] of problems) {
  let transposed = Array.from(args[0]).map((_, i) => args.map(arg => arg[i]).join(""));
  part2 += compute(op, transposed);
}
console.log("part2 =", part2);
// =10695785245101
