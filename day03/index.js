let raw = await Bun.file("day03/input").text();
let banks = raw.split("\n").map(l => l.split("").map(Number));

let getJoltage = (banks, batts) => {
  let joltage = 0;
  for (let bank of banks) {
    let j = 0;
    let bankJoltage = 0;
    for (let i = 0; i < batts; i++) {
      let batt = Math.max(...bank.slice(j, bank.length - batts + i + 1));
      j = bank.indexOf(batt, j) + 1;
      bankJoltage += batt * Math.pow(10, batts - i - 1);
    }
    joltage += bankJoltage;
  }
  return joltage;
}

let part1 = getJoltage(banks, 2);
console.log("part1 =", part1);
// =17193

let part2 = getJoltage(banks, 12);
console.log("part2 =", part2);
// =171297349921310
