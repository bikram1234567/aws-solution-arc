import { readFileSync, writeFileSync } from 'fs';

const text = readFileSync('./SAA-C03_text.txt', 'utf8');

// Remove page header/footer noise
const cleaned = text
  .replace(/Global IT Certification Hub\s*/g, '')
  .replace(/Page \d+ \| Visit[^\n]+\n/g, '')          // catches both full and truncated page footers
  .replace(/Visit\s*:[^\n]+\n/g, '')                   // residual "Visit : https://..." lines
  .replace(/For more exam questions[^\n]+\n/g, '')
  .replace(/Scan this QR code[^\n]+\n/g, '')
  .replace(/\n{3,}/g, '\n\n');

// Split into blocks by question number at start of line: "N. "
const lines = cleaned.split('\n');
const questionBlocks = [];
let currentBlock = [];
let currentNum = null;

for (const line of lines) {
  const m = line.match(/^(\d+)\. (.+)/);
  if (m) {
    const num = parseInt(m[1]);
    // Skip Q404 which is a "404 page not found" artifact
    if (num === 404 && line.toLowerCase().includes('page not found')) {
      continue;
    }
    // A real question line starts with a number, a period, a space, then a capital letter or "A "
    // Avoid matching mid-option lines like "2. Resize the..." where the context is inside option text
    const firstChar = m[2][0];
    const isLikelyQuestion = /[A-Z"(]/.test(firstChar);
    // Also: question numbers are >= 1 and generally sequential — reject if it would be a huge jump
    // More importantly: if this is a single-digit number and we're deep in a block, it's likely option continuation
    const numericJump = currentNum !== null ? num - currentNum : 0;
    // Accept if: first char is uppercase AND (num is 1 more than current OR currentNum is null OR it's a plausible jump)
    const isNewQuestion = isLikelyQuestion && (
      currentNum === null ||
      num === currentNum + 1 ||
      (num > currentNum && num < currentNum + 50)  // allow small forward jumps for skipped/repeated Qs
    );
    if (isNewQuestion) {
      if (currentBlock.length > 0 && currentNum !== null) {
        questionBlocks.push({ num: currentNum, lines: currentBlock });
      }
      currentNum = num;
      currentBlock = [line];
      continue;
    }
  }
  if (currentNum !== null) currentBlock.push(line);
}
if (currentBlock.length > 0 && currentNum !== null) {
  questionBlocks.push({ num: currentNum, lines: currentBlock });
}

// Parse each block into structured question
function parseBlock(block) {
  const fullText = block.lines.join('\n').trim();

  // Extract answer: "Suggested Answer: AB" or "Suggested Answer: A, B, C" or "Suggested Answer: A"
  // Options go up to F (6-option questions exist). Must stop at end of token.
  const answerMatch = fullText.match(/Suggested Answer:\s*([A-F]{1,6}|[A-F](?:[,\s]+[A-F])+)(?=\s|$)/i);
  let correctLetters = [];
  if (answerMatch) {
    const raw = answerMatch[1].trim();
    // Handle both "AB" / "CEF" concatenated and "A, B" or "A B" separated
    if (/^[A-F]{2,6}$/.test(raw)) {
      correctLetters = raw.toUpperCase().split('');
    } else {
      correctLetters = raw.split(/[,\s]+/).map(s => s.trim().toUpperCase()).filter(s => /^[A-F]$/.test(s));
    }
    // Deduplicate
    correctLetters = [...new Set(correctLetters)];
  }

  // Remove the answer + everything after from text
  const textBeforeAnswer = fullText.split(/Suggested Answer:/i)[0].trim();

  // Extract options: lines starting with A. / B. / C. / D. / E. (letter followed by . or ))
  const optionRe = /\n([A-F])[.)]\s+/g;
  const optionStarts = [];
  let om;
  while ((om = optionRe.exec(textBeforeAnswer)) !== null) {
    optionStarts.push({ letter: om[1], index: om.index });
  }

  let questionText = '';
  const options = [];

  if (optionStarts.length > 0) {
    questionText = textBeforeAnswer.slice(0, optionStarts[0].index).trim();
    questionText = questionText.replace(/^\d+\.\s*/, '').trim();

    for (let i = 0; i < optionStarts.length; i++) {
      // start: after "\nA. "  (1 newline + 1 letter + 1 period/paren + 1 space = 4 chars, but index is at the \n)
      const rawStart = optionStarts[i].index;
      // Find the actual text start: skip past the letter+punctuation
      const letterPlusDelim = textBeforeAnswer.slice(rawStart).match(/^\n[A-E][.)]\s+/);
      const textStart = rawStart + (letterPlusDelim ? letterPlusDelim[0].length : 3);
      const end = i + 1 < optionStarts.length ? optionStarts[i + 1].index : textBeforeAnswer.length;
      const optText = textBeforeAnswer.slice(textStart, end).trim().replace(/\n/g, ' ').replace(/\s{2,}/g, ' ');
      options.push({ letter: optionStarts[i].letter, text: optText });
    }
  } else {
    questionText = textBeforeAnswer.replace(/^\d+\.\s*/, '').trim();
  }

  questionText = questionText.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').trim();

  const multiSelect = correctLetters.length > 1;

  return {
    num: block.num,
    question: questionText,
    options,
    correctLetters,
    type: options.length > 0 ? 'mcq' : 'open',
    multiSelect
  };
}

const parsed = questionBlocks
  .map(parseBlock)
  .filter(q => q.question.length > 10 && q.options.length >= 2);

// Deduplicate by question number (keep first)
const seen = new Set();
const unique = parsed.filter(q => {
  if (seen.has(q.num)) return false;
  seen.add(q.num);
  return true;
});

unique.sort((a, b) => a.num - b.num);

// Stats
const withAnswers  = unique.filter(q => q.correctLetters.length > 0);
const noAnswers    = unique.filter(q => q.correctLetters.length === 0);
const multiSelect  = unique.filter(q => q.multiSelect);

console.log('Total questions:', unique.length);
console.log('With answers:', withAnswers.length);
console.log('No answers:', noAnswers.length);
console.log('Multi-select:', multiSelect.length);
console.log('Max Q num:', Math.max(...unique.map(q => q.num)));

// Show sample multi-select
if (multiSelect.length > 0) {
  console.log('\nSample multi-select:');
  console.log(JSON.stringify(multiSelect[0], null, 2));
}

// Show first few no-answer questions
if (noAnswers.length > 0) {
  console.log('\nSample no-answer questions:');
  noAnswers.slice(0, 3).forEach(q => {
    console.log(`Q${q.num}: ${q.question.slice(0, 80)} | opts: ${q.options.length}`);
  });
}

writeFileSync('./SAA-C03_questions.json', JSON.stringify(unique, null, 2), 'utf8');
console.log('\nWrote SAA-C03_questions.json');
