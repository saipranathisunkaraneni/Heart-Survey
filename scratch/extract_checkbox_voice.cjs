const fs = require('fs');

const code = fs.readFileSync('c:\\Users\\HP\\Downloads\\srinivasa-heart-foundation-health-survey (1)\\scratch\\temp_zip2\\src\\App.tsx', 'utf8');
const lines = code.split('\n');

let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('startCheckboxSequentialVoice')) {
    startIdx = i;
  }
  if (lines[i].includes('handleYesNoVoicePrompt') && startIdx !== -1 && endIdx === -1) {
    endIdx = i;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  console.log(lines.slice(startIdx - 5, endIdx).join('\n'));
} else {
  console.log("Checkbox sequential voice logic not found", startIdx, endIdx);
}
