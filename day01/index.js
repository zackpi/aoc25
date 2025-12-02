let raw = await Bun.file("day01/input").text();
let moves = raw.split("\n").map((l) => [l[0] === 'L' ? -1 : 1, parseInt(l.slice(1))]);

let mod = (n, m) => ((n % m) + m) % m;

let [_, part1, part2] = moves.reduce(([psum, zeroes, crossings], move, i) => {
  let before = psum;

  let distance = move[0] * move[1];
  psum += distance;

  if (before < psum) {
    // moving up
    for (let p = before + 1; p <= psum; p++) {
      if (mod(p, 100) === 0) {
        crossings++;
      }
    }
  } else {
    // moving down
    for (let p = before - 1; p >= psum; p--) {
      if (mod(p, 100) === 0) {
        crossings++;
      }
    }
  }
  
  psum = mod(psum, 100);
  
  if (psum === 0) {
    zeroes++;
  }

  return [psum, zeroes, crossings];
}, [50, 0, 0]);

console.log("part1 =", part1);
// =1021

console.log("part2 =", part2);
// =5933
