const fs = require('fs');

const code = fs.readFileSync('c:\\Users\\HP\\Downloads\\srinivasa-heart-foundation-health-survey (1)\\scratch\\temp_zip2\\src\\App.tsx', 'utf8');
const lines = code.split('\n');

lines.forEach((line, i) => {
  if (line.includes('activeCheckboxVoice')) {
    console.log(`Line ${i+1}: ${line}`);
    if (line.includes('&& (')) {
      console.log("Found modal start at line", i + 1);
      console.log(lines.slice(i, i + 80).join('\n'));
    }
  }
});
