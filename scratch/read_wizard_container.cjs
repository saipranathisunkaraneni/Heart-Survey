const fs = require('fs');

const code = fs.readFileSync('c:\\Users\\HP\\Downloads\\srinivasa-heart-foundation-health-survey (1)\\scratch\\temp_zip2\\src\\App.tsx', 'utf8');
const lines = code.split('\n');

let foundIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('renderStepContent()')) {
    foundIndex = i;
    break;
  }
}

if (foundIndex !== -1) {
  console.log(lines.slice(foundIndex - 45, foundIndex + 45).join('\n'));
} else {
  console.log("renderStepContent() call not found");
}
