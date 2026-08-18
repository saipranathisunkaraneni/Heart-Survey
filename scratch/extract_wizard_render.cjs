const fs = require('fs');

const code = fs.readFileSync('c:\\Users\\HP\\Downloads\\srinivasa-heart-foundation-health-survey (1)\\scratch\\temp_zip2\\src\\App.tsx', 'utf8');
const lines = code.split('\n');

const startIndex = 1000;
const endIndex = 2450;

const extractedLines = lines.slice(startIndex, endIndex);
fs.writeFileSync('C:\\Users\\HP\\.gemini\\antigravity\\brain\\cdb5062e-d0d1-48d9-9494-063f99a17eee\\scratch\\original_wizard_render.txt', extractedLines.join('\n'));
console.log("Extracted wizard lines successfully.");
