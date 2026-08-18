const fs = require('fs');

const code = fs.readFileSync('c:\\Users\\HP\\Downloads\\srinivasa-heart-foundation-health-survey (1)\\scratch\\temp_zip2\\src\\App.tsx', 'utf8');
const lines = code.split('\n');

let output = [];
lines.forEach((line, i) => {
  if (line.includes('handleYesNoVoicePrompt') || line.includes('toggleSpeechRecognition') || line.includes('handleGenderVoiceInput')) {
    console.log(`Line ${i+1}: ${line}`);
    output.push(`\n--- Line ${i+1} ---`);
    output.push(lines.slice(Math.max(0, i - 10), i + 35).join('\n'));
  }
});

fs.writeFileSync('C:\\Users\\HP\\.gemini\\antigravity\\brain\\cdb5062e-d0d1-48d9-9494-063f99a17eee\\scratch\\voice_logic.txt', output.join('\n'));
console.log("Wrote voice_logic.txt successfully.");
