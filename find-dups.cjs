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
    } else if (file.endsWith(".tsx") || file.endsWith(".jsx") || file.endsWith(".ts")) {
      results.push(file);
    }
  });
  return results;
}

const files = walk("src");

// Check all constant arrays with 'id'
for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  
  // Find const Foo = [ ... ]
  const constArrays = [...content.matchAll(/const\s+([A-Za-z0-9_]+)\s*(?::\s*[^=]+)?=\s*\[([\s\S]*?)\];/g)];
  for (const match of constArrays) {
    const name = match[1];
    const body = match[2];
    const ids = [...body.matchAll(/id:\s*["'`]([^"'`]+)["'`],?/g)].map(m => m[1]);
    const idSet = new Set();
    const dups = [];
    for (const id of ids) {
      if (idSet.has(id)) dups.push(id);
      idSet.add(id);
    }
    if (dups.length > 0) {
      console.log(`DUPLICATE IDs in ${file} -> const ${name}:`, dups);
    }
  }

  // Also check inline arrays in JSX: {[ ... ].map(
  const inlineArrays = [...content.matchAll(/\{\s*\[([\s\S]*?)\]\.map/g)];
  for (const match of inlineArrays) {
    const body = match[1];
    const ids = [...body.matchAll(/id:\s*["'`]([^"'`]+)["'`],?/g)].map(m => m[1]);
    const idSet = new Set();
    const dups = [];
    for (const id of ids) {
      if (idSet.has(id)) dups.push(id);
      idSet.add(id);
    }
    if (dups.length > 0) {
      console.log(`DUPLICATE INLINE IDs in ${file}:`, dups);
    }
  }
}
