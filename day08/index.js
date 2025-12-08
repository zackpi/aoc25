let raw = await Bun.file("day08/input").text();
let pos = raw.split("\n").map(line => line.split(",").map(Number));

let key = (a, b) => {
  if (a > b) [a, b] = [b, a];
  return `${a},${b}`;
}

let distance = (a, b) => {
  return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2);
}

let edges = new Map();
for (let i = 0; i < pos.length; i++) {
  for (let j = 0; j < pos.length; j++) {
    let k = key(i, j);
    if (i === j || edges.has(k)) continue;
    let d = distance(pos[i], pos[j]);
    edges.set(k, d);
  }
}
let sortedEdges = Array.from(edges.entries()).sort((a, b) => a[1] - b[1]);

let cliques = Array.from(pos).map((_, i) => new Set([i]));
let cliqueMap = new Map();
for (let i = 0; i < pos.length; i++) {
  cliqueMap.set(i, i);
}

let threshold = 1000;
let part1 = 0;
let part2 = 0;
for (let [k, _] of sortedEdges) {
  let [a, b] = k.split(",").map(Number);
  let cliqueA = cliqueMap.get(a);
  let cliqueB = cliqueMap.get(b);
  threshold -= 1;
  if (cliqueA !== cliqueB) {

    let setA = cliques[cliqueA];
    let setB = cliques[cliqueB];
    if (setA.size < setB.size) {
      [setA, setB] = [setB, setA];
      [cliqueA, cliqueB] = [cliqueB, cliqueA];
    }
    for (let v of setB) {
      setA.add(v);
      cliqueMap.set(v, cliqueA);
    }
    cliques[cliqueB] = null;

    if (setA.size === pos.length) {
      part2 = pos[a][0] * pos[b][0];
    }
  }

  if (threshold === 0) {
    part1 = cliques.map(c => c?.size ?? 0).toSorted((a, b) => b - a).slice(0, 3).reduce((a, b) => a * b, 1);
  }
}

console.log("part1 =", part1);
// =129564

console.log("part2 =", part2);
// =42047840
