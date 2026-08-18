const fs = require('fs');
const { execSync } = require('child_process');

const sourceZip = 'c:\\Users\\HP\\Downloads\\srinivasa-heart-foundation-health-survey (1).zip';
const destZip = 'c:\\Users\\HP\\Downloads\\srinivasa-heart-foundation-health-survey (1)\\scratch\\temp.zip';
const outDir = 'c:\\Users\\HP\\Downloads\\srinivasa-heart-foundation-health-survey (1)\\scratch\\temp_zip2';

try {
  fs.copyFileSync(sourceZip, destZip);
  console.log("Copied zip successfully");
  
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  execSync(`tar -xf "${destZip}" -C "${outDir}"`);
  console.log("Extracted zip successfully");
  
  fs.unlinkSync(destZip);
  console.log("Cleaned up temp.zip");
} catch (e) {
  console.error("Error:", e);
}
