const fs = require('fs');
const path = require('path');

const root = path.join(process.cwd(), 'public');

function countFiles(dir) {
  let count = 0;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isFile()) {
      count++;
    } else if (entry.isDirectory()) {
      count += countFiles(fullPath);
    }
  }

  return count;
}

console.log(countFiles(root));
