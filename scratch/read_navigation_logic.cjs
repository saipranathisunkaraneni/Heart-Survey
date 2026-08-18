const fs = require('fs');

const code = fs.readFileSync('c:\\Users\\HP\\Downloads\\srinivasa-heart-foundation-health-survey (1)\\scratch\\temp_zip2\\src\\App.tsx', 'utf8');
const lines = code.split('\n');

let foundIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const handleNext') || lines[i].includes('const handlePrev') || lines[i].includes('const handleSubmit') || lines[i].includes('handleFinalSubmit')) {
    console.log(`Line ${i+1}: ${lines[i]}`);
    if (foundIndex === -1) foundIndex = i;
  }
}

if (foundIndex !== -1) {
  console.log("\n--- NAVIGATION CODE DUMP ---");
  console.log(lines.slice(foundIndex - 5, foundIndex + 90).join('\n'));
} else {
  console.log("Navigation methods not found");
}
