const fs = require('fs');

const step16 = JSON.parse(fs.readFileSync('C:\\Users\\HP\\.gemini\\antigravity\\brain\\cdb5062e-d0d1-48d9-9494-063f99a17eee\\scratch\\step16.json', 'utf8'));
console.log("Keys:", Object.keys(step16));
if (step16.tool_calls) {
  console.log("Tool calls count:", step16.tool_calls.length);
  step16.tool_calls.forEach((tc, idx) => {
    console.log(`Tool call ${idx}: name=${tc.name}`);
    if (tc.response) {
      console.log(`  Response length: ${tc.response.length}`);
      console.log(`  Response snippet: ${tc.response.slice(0, 300)}`);
    } else {
      console.log(`  No response field on tool_call itself`);
    }
  });
}
if (step16.content) {
  console.log("Content length:", step16.content.length);
  console.log("Content snippet:", step16.content.slice(0, 300));
}
