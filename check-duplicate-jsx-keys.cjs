const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith(".tsx")) {
      results.push(file);
    }
  });
  return results;
}

const files = walk("src");

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  
  // Find JSX blocks with sibling elements having key=...
  // Look for consecutive or sibling elements with key=
  const keyMatches = [...content.matchAll(/key=(?:\{([^}]+)\}|"([^"]+)")/g)];
  // Check if identical key strings appear close to each other in the same component
  const keyLocations = [];
  for (const m of keyMatches) {
    const keyVal = m[1] || m[2];
    const index = m.index;
    const lineNumber = content.substring(0, index).split("\n").length;
    keyLocations.push({ keyVal, lineNumber, index });
  }

  // Check for duplicate key occurrences within 50 lines or in same map
  for (let i = 0; i < keyLocations.length; i++) {
    for (let j = i + 1; j < keyLocations.length; j++) {
      if (keyLocations[i].keyVal === keyLocations[j].keyVal && Math.abs(keyLocations[i].lineNumber - keyLocations[j].lineNumber) < 60) {
        // Exclude common simple variable references like idx or i or index
        if (!["i", "idx", "index", "key"].includes(keyLocations[i].keyVal)) {
          console.log(`POTENTIAL DUPLICATE KEY in ${file}: lines ${keyLocations[i].lineNumber} & ${keyLocations[j].lineNumber} -> key=${keyLocations[i].keyVal}`);
        }
      }
    }
  }
}
