const pdfParse = require('pdf-parse/lib/pdf-parse.js');
const { readFileSync, writeFileSync } = require('fs');

const buf = readFileSync('./SAA-C03_Exam.pdf');
pdfParse(buf).then(data => {
  writeFileSync('./SAA-C03_text.txt', data.text, 'utf8');
  console.log('Pages:', data.numpages);
  console.log('Characters:', data.text.length);
  console.log('--- FIRST 4000 CHARS ---');
  console.log(data.text.slice(0, 4000));
});
