let raw = await Bun.file("day08/input").text();
let pos = raw.split("\n").map(line => line.split(",").map(Number));

function reference() {
  let key = (a, b) => {
    if (a > b) [a, b] = [b, a];
    return `${a},${b}`;
  }

  let distance = (a, b) => {
    return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2);
  }

  let edges = new Map();
  let max = -Infinity;
  for (let i = 0; i < pos.length; i++) {
    for (let j = 0; j < pos.length; j++) {
      let k = key(i, j);
      if (i === j || edges.has(k)) continue;
      let d = distance(pos[i], pos[j]);
      edges.set(k, d);
    }

    max = Math.max(max, ...pos[i]);
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

  return { part1, part2 };
}

function fast() {
  const MAX_COORD = 100_000;

  function key (a, b) {
    if (a > b) [a, b] = [b, a];
    return a * MAX_COORD + b;
  }

  function distSqr (a, b) {
    return (a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2;
  }

  let N = 16;
  let SIZE = MAX_COORD / N;
  let bins = Array.from({ length: N * N * N }, () => []);
  for (let i = 0; i < pos.length; i++) {
    let [x, y, z] = pos[i];

    let binX = Math.floor(x / SIZE);
    let binY = Math.floor(y / SIZE);
    let binZ = Math.floor(z / SIZE);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          let nx = binX + dx;
          let ny = binY + dy;
          let nz = binZ + dz;
          if (nx < 0 || nx >= N || ny < 0 || ny >= N || nz < 0 || nz >= N) continue;
          let binIndex = nx * N * N + ny * N + nz;
          bins[binIndex].push(i);
        }
      }
    }
  }

  let binnedEdges = new Map();
  for (let bin of bins) {
    for (let i = 0; i < bin.length; i++) {
      for (let j = 0; j < bin.length; j++) {
        let a = bin[i];
        let b = bin[j];
        let k = key(a, b);
        if (a === b || binnedEdges.has(k)) continue;
        let d = distSqr(pos[a], pos[b]);
        binnedEdges.set(k, d);
      }
    }
  }
  let sortedEdges = Array.from(binnedEdges.entries()).sort((a, b) => a[1] - b[1]);

  let cliques = Array.from(pos).map((_, i) => new Set([i]));
  let cliqueMap = new Map();
  for (let i = 0; i < pos.length; i++) {
    cliqueMap.set(i, i);
  }

  let threshold = 1000;

  let part1 = 0;
  let part2 = 0;
  for (let [k, _] of sortedEdges) {
    let a = Math.floor(k / MAX_COORD);
    let b = k % MAX_COORD;
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

  return { part1, part2 };
}

let timed = (fn, n) => {
  let start = performance.now();
  let result = fn(n);
  let end = performance.now();
  console.log(`Time for ${fn.name}: ${((end - start) / n).toFixed(2)} ms`);
  return result;
}

let refResult = timed(reference, 1);

let fastResult = timed((n) => {
  let result;
  console.profile("fast");
  for (let i = 0; i < n; i++) {
    result = fast();
  }
  console.profileEnd("fast");
  return result;
}, 10);

console.log("part1 =", refResult.part1, "?=", fastResult.part1, refResult.part1 === fastResult.part1);
// =129564

console.log("part2 =", refResult.part2, "?=", fastResult.part2, refResult.part2 === fastResult.part2);
// =42047840
