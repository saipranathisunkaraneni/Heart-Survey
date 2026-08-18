const fs = require('fs');

const code = fs.readFileSync('c:\\Users\\HP\\Downloads\\srinivasa-heart-foundation-health-survey (1)\\scratch\\temp_zip2\\src\\App.tsx', 'utf8');
const lines = code.split('\n');

// We want to extract:
// - speakText
// - speakThenListen
// - toggleSpeechRecognition
// - handleGenderVoiceInput
// - handleYesNoVoicePrompt
// - handleCheckboxVoicePrompt / startCheckboxSequentialVoice etc.

function getFunctionBody(funcName, lines) {
  let startIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(funcName) && (lines[i].includes('const ') || lines[i].includes('function '))) {
      startIndex = i;
      break;
    }
  }
  if (startIndex === -1) return `// Function ${funcName} not found`;
  
  // Find matching brace
  let braceCount = 0;
  let endIndex = -1;
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    for (let char of line) {
      if (char === '{') braceCount++;
      else if (char === '}') braceCount--;
    }
    if (braceCount === 0 && braceCount !== 0) { // wait
    }
    // Simple heuristic: if we find brace count going back to 0 after starting
    if (braceCount === 0 && i > startIndex) {
      endIndex = i;
      break;
    }
  }
  if (endIndex === -1) {
    // Try larger window
    return lines.slice(startIndex, startIndex + 100).join('\n');
  }
  return lines.slice(startIndex, endIndex + 1).join('\n');
}

const methods = ['speakText', 'speakThenListen', 'toggleSpeechRecognition', 'handleGenderVoiceInput', 'handleYesNoVoicePrompt'];
let output = [];
methods.forEach(m => {
  output.push(`\n=== METHOD: ${m} ===`);
  output.push(getFunctionBody(m, lines));
});

fs.writeFileSync('C:\\Users\\HP\\.gemini\\antigravity\\brain\\cdb5062e-d0d1-48d9-9494-063f99a17eee\\scratch\\voice_logic_full.txt', output.join('\n'));
console.log("Wrote voice_logic_full.txt successfully.");
