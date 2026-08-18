const fs = require('fs');

const fileContent = fs.readFileSync('c:\\Users\\HP\\Downloads\\srinivasa-heart-foundation-health-survey (1)\\src\\translations.ts', 'utf8');

// Find all keys inside the te.questions block
const enQuestionsStart = fileContent.indexOf('questions: {');
const enQuestionsEnd = fileContent.indexOf('},', enQuestionsStart);
const questionsBlock = fileContent.substring(enQuestionsStart, enQuestionsEnd + 2);

console.log("Questions translation block snippet:");
console.log(questionsBlock.slice(0, 1000));
