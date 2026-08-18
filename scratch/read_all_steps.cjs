const fs = require('fs');

const code = fs.readFileSync('c:\\Users\\HP\\Downloads\\srinivasa-heart-foundation-health-survey (1)\\scratch\\temp_zip2\\src\\App.tsx', 'utf8');
const lines = code.split('\n');

let output = [];
output.push("--- IMPORTS AND STATES ---");
output.push(lines.slice(0, 300).join('\n'));

output.push("\n\n--- SWITCH CASE WIZARD ---");
output.push(lines.slice(1000, 2200).join('\n'));

fs.writeFileSync('C:\\Users\\HP\\.gemini\\antigravity\\brain\\cdb5062e-d0d1-48d9-9494-063f99a17eee\\scratch\\original_render.txt', output.join('\n'));
console.log("Wrote original_render.txt successfully.");
