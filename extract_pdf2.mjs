import { readFileSync, writeFileSync } from 'fs';

// Use pdfjs-dist legacy build (no worker needed in Node)
const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

const pdfPath = './SAA-C03_Exam.pdf';
const data = new Uint8Array(readFileSync(pdfPath));

const loadingTask = pdfjsLib.getDocument({ data, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true });
const pdf = await loadingTask.promise;

console.log('Total pages:', pdf.numPages);

let fullText = '';
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const content = await page.getTextContent();
  // Join items, preserving line breaks via hasEOL
  let pageText = '';
  for (const item of content.items) {
    if (item.str) pageText += item.str;
    if (item.hasEOL) pageText += '\n';
    else pageText += ' ';
  }
  fullText += pageText + '\n';
}

writeFileSync('./SAA-C03_text.txt', fullText, 'utf8');
console.log('Characters written:', fullText.length);
console.log('\n--- FIRST 4000 CHARS ---\n');
console.log(fullText.slice(0, 4000));
