const fs = require('fs');

const code = fs.readFileSync('c:\\Users\\HP\\Downloads\\srinivasa-heart-foundation-health-survey (1)\\scratch\\temp_zip2\\src\\App.tsx', 'utf8');
const lines = code.split('\n');

console.log("Original App.tsx lines:", lines.length);

// Let's find "switch" or "case" in the wizard rendering
let insideRenderForm = false;
let foundCases = [];
lines.forEach((line, i) => {
  if (line.includes('switch') && line.includes('step')) {
    console.log(`Line ${i+1}: ${line}`);
  }
  if (line.match(/^\s*case\s+\d+:/)) {
    foundCases.push({ lineNum: i + 1, content: line });
  }
});

console.log(`Found ${foundCases.length} cases:`);
foundCases.forEach(c => {
  // Look ahead 5 lines
  const ahead = lines.slice(c.lineNum, c.lineNum + 5).join(' ');
  console.log(`  Line ${c.lineNum}: ${c.content.trim()} -- ahead: ${ahead.slice(0, 150)}`);
});
