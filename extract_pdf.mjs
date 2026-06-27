import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { readFileSync, writeFileSync } from 'fs';

const buf = readFileSync('./SAA-C03_Exam.pdf');
const data = await pdfParse(buf);
writeFileSync('./SAA-C03_text.txt', data.text, 'utf8');
console.log('Pages:', data.numpages);
console.log('Characters:', data.text.length);
console.log('--- FIRST 3000 CHARS ---');
console.log(data.text.slice(0, 3000));
