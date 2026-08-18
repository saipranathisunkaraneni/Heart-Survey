const fs = require('fs');

const code = fs.readFileSync('c:\\Users\\HP\\Downloads\\srinivasa-heart-foundation-health-survey (1)\\scratch\\temp_zip2\\src\\App.tsx', 'utf8');
const lines = code.split('\n');

let foundIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('activeCheckboxVoice') && lines[i].includes('fixed')) {
    foundIndex = i;
    break;
  }
}

if (foundIndex !== -1) {
  console.log(lines.slice(foundIndex, foundIndex + 85).join('\n'));
} else {
  console.log("activeCheckboxVoice modal markup not found");
}
