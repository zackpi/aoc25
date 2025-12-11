let raw = await Bun.file("day11/input").text();

let edges = raw.split("\n").map(line => {
  let [from, to] = line.split(": ").map(s => s.trim());
  return { from, to: to.split(" ") };
});

let edgesMap = new Map();
for (let {from, to} of edges) {
  edgesMap.set(from, to);
}

let countPaths = (node) => {
  if (node === "out") return 1;

  let total = 0;
  for (let neighbor of edgesMap.get(node)) {
    total += countPaths(neighbor);
  }

  return total;
}

let part1 = countPaths("you");
console.log("part1 =", part1);
// =701

let cache = new Map();
let countPaths2 = (node, hasSeenFFT, hasSeenDAC) => {
  let key = `${node}|${hasSeenFFT}|${hasSeenDAC}`;
  if (cache.has(key)) return cache.get(key);

  if (node === "out") return hasSeenFFT && hasSeenDAC ? 1 : 0;

  let total = 0;
  for (let neighbor of edgesMap.get(node)) {
    let seenFFT = hasSeenFFT || neighbor === "fft";
    let seenDAC = hasSeenDAC || neighbor === "dac";
    total += countPaths2(neighbor, seenFFT, seenDAC);
  }

  cache.set(key, total);
  return total;
}

let part2 = countPaths2("svr", false, false);
console.log("part2 =", part2);
// =390108778818526
