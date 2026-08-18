const fs = require('fs');

const transcriptPath = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\cdb5062e-d0d1-48d9-9494-063f99a17eee\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.step_index === 329) {
      console.log(obj.content);
      break;
    }
  } catch (e) {
    // ignore
  }
}
