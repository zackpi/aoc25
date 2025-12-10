// let raw = await Bun.file("day10/input_small").text();
let raw = await Bun.file("day10/input").text();

let machines = raw.split("\n").map(line => {
  let lights = [...line.matchAll(/^\[(.*?)\]/g)][0][1];
  let buttons = [...line.matchAll(/\((.*?)\)/g)].map(m => m[1].split(",").map(Number));
  let joltages = [...line.matchAll(/\{(.*?)\}$/g)][0][1].split(",").map(Number);
  return { lights, buttons, joltages };
});

let cache = new Map();
let startMachine1 = (lights, buttons) => {
  if (cache.has(lights)) return cache.get(lights);
  cache.set(lights, Infinity);

  if (!lights.includes("#")) {
    cache.set(lights, 0);
    return 0;
  }

  let minSteps = Infinity;
  for (let button of buttons) {
    let newLights = Array.from(lights);
    for (let pos of button) {
      newLights[pos] = newLights[pos] === "#" ? "." : "#";
    }
    newLights = newLights.join("");

    let steps = startMachine1(newLights, buttons);
    minSteps = Math.min(minSteps, steps + 1);
  }

  cache.set(lights, minSteps);
  return minSteps;
}

let part1 = 0;
for (let {lights, buttons} of machines) {
  cache.clear();
  part1 += startMachine1(lights, buttons);
}
console.log("part1 =", part1);
// =530

let startMachine2 = (counters, buttons) => {
  // console.log("counters =", counters);
  let key = counters.join(",");
  if (cache.has(key)) return cache.get(key);
  cache.set(key, Infinity);

  if (counters.every(c => c === 0)) {
    cache.set(key, 0);
    return 0;
  } else if (counters.some(c => c < 0)) {
    return Infinity;
  }

  let minSteps = Infinity;
  for (let button of buttons) {

    // // start by trying to press button max number of times to reduce recursion
    // let maxPresses = Math.min(...button.map(pos => counters[pos]));
    // if (maxPresses > 1) {
    //   for (let i = maxPresses; i > 0; i--) {
    //     let testCounters = counters.slice();
    //     for (let pos of button) {
    //       testCounters[pos] -= i;
    //     }
    //     let steps = startMachine2(testCounters, buttons);
    //     minSteps = Math.min(minSteps, steps + i);
    //   }
    // }

    let testCounters = counters.slice();
    for (let pos of button) {
      testCounters[pos] -= 1;
    }
    let steps = startMachine2(testCounters, buttons);
    minSteps = Math.min(minSteps, steps + 1);
  }

  cache.set(key, minSteps);
  return minSteps;
}

let part2 = 0;
for (let {lights, buttons, joltages} of machines) {
  console.log("lights =", lights);
  cache.clear();
  part2 += startMachine2(joltages, buttons);
}
console.log("part2 =", part2);
// =
