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

// Look for .map( in every file and inspect the key= prop inside it
for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes(".map(")) {
      // Find the return element and its key in the following 10 lines
      const slice = lines.slice(i, Math.min(lines.length, i + 15)).join("\n");
      const keyMatch = slice.match(/key=\{([^}]+)\}/);
      if (keyMatch) {
        const keyVal = keyMatch[1].trim();
        // Check if keyVal is a static string or doesn't have an index or unique id
        if (keyVal.startsWith('"') || keyVal.startsWith("'")) {
          console.log(`STATIC KEY in ${file}:${i + 1} -> key={${keyVal}}`);
        }
      }
    }
  }
}
