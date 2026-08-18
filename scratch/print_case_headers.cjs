const fs = require('fs');

const code = fs.readFileSync('c:\\Users\\HP\\Downloads\\srinivasa-heart-foundation-health-survey (1)\\scratch\\temp_zip2\\src\\App.tsx', 'utf8');
const lines = code.split('\n');

const cases = [1028, 1259, 1586, 1731, 1890, 1996];

cases.forEach((lineIdx, i) => {
  console.log(`\n--- CASE ${i} (Line ${lineIdx}) ---`);
  const chunk = lines.slice(lineIdx - 1, lineIdx + 40).join('\n');
  console.log(chunk);
});
