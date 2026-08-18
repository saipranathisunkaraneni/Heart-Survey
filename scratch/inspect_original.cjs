const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\HP\\.gemini\\antigravity\\brain\\cdb5062e-d0d1-48d9-9494-063f99a17eee\\scratch\\original_wizard_render.txt', 'utf8');

const regex = /t\.questions\.(\w+)/g;
let match;
const matches = new Set();
while ((match = regex.exec(content)) !== null) {
  matches.add(match[1]);
}

console.log('Found questions in original_wizard_render.txt:', Array.from(matches));
console.log('Total questions count:', matches.size);
