import { readFileSync, writeFileSync } from 'fs';

const raw = JSON.parse(readFileSync('./SAA-C03_questions.json', 'utf8'));
const questions = raw.filter(q => q.correctLetters.length > 0 && q.options.length >= 2);

// Escape for embedding in HTML
const questionsJson = JSON.stringify(questions);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>AWS SAA-C03 Practice Quiz</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, "Segoe UI", system-ui, sans-serif;
  font-size: 15px; line-height: 1.6;
  background: #f0f4f8; color: #1f2328;
  min-height: 100vh; display: flex; flex-direction: column; align-items: center;
  padding: 24px 16px 56px;
}
.container { width: 100%; max-width: 820px; }

/* ---- header ---- */
.app-header { text-align: center; margin-bottom: 28px; }
.app-header h1 { font-size: 22px; font-weight: 800; color: #1f2328; }
.app-header .badge { display: inline-block; background: #ff9900; color: #fff; font-size: 12px; font-weight: 700; padding: 2px 10px; border-radius: 12px; margin-top: 4px; }
.app-header p { color: #57606a; font-size: 13px; margin-top: 6px; }

/* ---- home screen ---- */
.home-card {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
  padding: 32px 32px 28px; margin-bottom: 16px;
}
.home-card h2 { font-size: 17px; font-weight: 700; margin-bottom: 16px; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
.stat-box { background: #f7f8fa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 12px; text-align: center; }
.stat-box .val { font-size: 24px; font-weight: 800; color: #3b82d4; }
.stat-box .lbl { font-size: 12px; color: #57606a; margin-top: 2px; }

.options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
.option-label { font-size: 13px; font-weight: 600; color: #57606a; margin-bottom: 6px; display: block; }
select, input[type=number] {
  width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px;
  font-size: 14px; font-family: inherit; background: #f7f8fa; color: #1f2328;
}
select:focus, input[type=number]:focus { outline: 2px solid #3b82d4; border-color: transparent; }

.domain-section { margin-bottom: 20px; }
.domain-section .option-label { margin-bottom: 8px; }
.domain-checks { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.domain-check { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; }
.domain-check input { width: 15px; height: 15px; cursor: pointer; accent-color: #3b82d4; }

/* ---- buttons ---- */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 10px 24px; border-radius: 7px; border: none;
  font-size: 14px; font-weight: 700; cursor: pointer; transition: opacity .15s;
  font-family: inherit;
}
.btn:hover { opacity: .85; }
.btn:disabled { opacity: .5; cursor: not-allowed; }
.btn-primary { background: #ff9900; color: #fff; }
.btn-secondary { background: #e5e7eb; color: #1f2328; }
.btn-outline { background: #fff; color: #3b82d4; border: 2px solid #3b82d4; }
.btn-sm { padding: 6px 14px; font-size: 13px; }
.btn-block { width: 100%; }

/* ---- progress bar ---- */
.prog-wrap { height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin-bottom: 20px; }
.prog-bar { height: 100%; background: #ff9900; border-radius: 4px; transition: width .4s; }

/* ---- quiz card ---- */
.quiz-card {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
  padding: 28px 28px 24px;
}
.quiz-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.quiz-meta .q-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #57606a; }
.quiz-meta .q-num { font-size: 13px; color: #57606a; }
.quiz-meta .q-domain { font-size: 11px; background: #f0f4f8; border: 1px solid #e5e7eb; padding: 2px 10px; border-radius: 10px; color: #57606a; }

.quiz-question { font-size: 16px; font-weight: 600; color: #1f2328; margin-bottom: 8px; line-height: 1.65; }
.multi-hint { font-size: 12px; font-weight: 700; color: #7c5cd8; background: #f3f0ff; border: 1px solid #d8b4fe; border-radius: 5px; padding: 3px 10px; display: inline-block; margin-bottom: 16px; }

/* ---- option buttons ---- */
.opts { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.opt {
  text-align: left; padding: 12px 16px; border: 2px solid #e5e7eb;
  border-radius: 8px; background: #fff; font-size: 14px; cursor: pointer;
  transition: border-color .15s, background .15s; color: #1f2328;
  font-family: inherit; line-height: 1.5; display: flex; align-items: flex-start; gap: 10px;
}
.opt:hover:not(:disabled) { border-color: #ff9900; background: #fff8ef; }
.opt.selected { border-color: #ff9900; background: #fff3dd; }
.opt.correct { border-color: #1a7f37; background: #d4f5e2; color: #1a7f37; }
.opt.wrong   { border-color: #cf222e; background: #ffe0e3; color: #cf222e; }
.opt.reveal  { border-color: #1a7f37; background: #edfbf2; color: #1a7f37; }
.opt-letter { font-weight: 800; flex-shrink: 0; min-width: 20px; }
.opt-check {
  width: 17px; height: 17px; flex-shrink: 0; margin-top: 2px;
  border: 2px solid #c9d1d9; border-radius: 4px; background: #fff;
  display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800;
}
.opt.selected .opt-check { border-color: #ff9900; background: #ff9900; color: #fff; }
.opt.correct .opt-check  { border-color: #1a7f37; background: #1a7f37; color: #fff; }
.opt.wrong   .opt-check  { border-color: #cf222e; background: #cf222e; color: #fff; }

/* ---- feedback ---- */
.feedback {
  border-radius: 7px; padding: 11px 14px; font-size: 14px;
  margin-bottom: 16px; display: none; line-height: 1.55;
}
.feedback.correct { background: #d4f5e2; color: #1a7f37; border: 1px solid #8bda9c; }
.feedback.wrong   { background: #ffe0e3; color: #cf222e; border: 1px solid #f5a0a8; }

/* ---- quiz actions ---- */
.quiz-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }

/* ---- results ---- */
.results-header {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
  padding: 32px; text-align: center; margin-bottom: 16px;
}
.score-ring {
  width: 120px; height: 120px; border-radius: 50%; margin: 0 auto 18px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  border: 7px solid #ff9900; background: #fff;
}
.score-ring .pct { font-size: 32px; font-weight: 900; color: #ff9900; }
.score-ring .raw { font-size: 12px; color: #57606a; }
.results-title { font-size: 21px; font-weight: 800; margin-bottom: 6px; }
.results-sub { color: #57606a; font-size: 14px; }

.domain-breakdown { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
.db-card { background: #f7f8fa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 14px; }
.db-card .db-name { font-size: 12px; font-weight: 700; color: #57606a; margin-bottom: 6px; }
.db-bar-wrap { height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
.db-bar { height: 100%; background: #3b82d4; border-radius: 3px; }
.db-score { font-size: 12px; color: #57606a; }

.review-section { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; }
.review-section h2 { font-size: 15px; font-weight: 700; margin-bottom: 14px; }
.review-list { display: flex; flex-direction: column; gap: 12px; }
.rv { background: #f7f8fa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; }
.rv.rv-ok   { border-left: 4px solid #1a7f37; }
.rv.rv-bad  { border-left: 4px solid #cf222e; }
.rv.rv-skip { border-left: 4px solid #9ca3af; }
.rv-badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px; margin-bottom: 6px; }
.rv-badge.ok   { background: #d4f5e2; color: #1a7f37; }
.rv-badge.bad  { background: #ffe0e3; color: #cf222e; }
.rv-badge.skip { background: #f0f0f0; color: #57606a; }
.rv-q { font-weight: 600; font-size: 13px; margin-bottom: 5px; }
.rv-ans { font-size: 13px; color: #57606a; }
.rv-correct { font-size: 13px; color: #1a7f37; margin-top: 2px; }

/* ---- timer ---- */
.timer { font-size: 16px; font-weight: 700; color: #1f2328; }
.timer.warn { color: #cf222e; }

/* ---- bookmarks / filters ---- */
.top-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
.flag-btn { background: none; border: 1px solid #e5e7eb; border-radius: 6px; padding: 5px 12px; cursor: pointer; font-size: 13px; font-family: inherit; color: #57606a; }
.flag-btn.flagged { border-color: #ff9900; color: #ff9900; background: #fff8ef; }

/* ---- scrollable review ---- */
.review-scroll { max-height: 600px; overflow-y: auto; padding-right: 4px; }

/* ---- responsive ---- */
@media (max-width: 520px) {
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .options-grid { grid-template-columns: 1fr; }
  .domain-checks { grid-template-columns: 1fr; }
  .domain-breakdown { grid-template-columns: 1fr; }
}

/* ---- footer ---- */
footer { margin-top: 32px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px; width: 100%; max-width: 820px; }
</style>
</head>
<body>
<div class="container">

  <div class="app-header">
    <h1>AWS Solutions Architect</h1>
    <div class="badge">SAA-C03 Practice Exam</div>
    <p>Official question bank • 1,018 questions with answers • 122 multi-select</p>
  </div>

  <!-- ========== HOME ========== -->
  <div id="homeScreen">
    <div class="home-card">
      <h2>Exam Statistics</h2>
      <div class="stats-grid">
        <div class="stat-box"><div class="val">1,018</div><div class="lbl">Total Questions</div></div>
        <div class="stat-box"><div class="val">130</div><div class="lbl">Minutes (Real Exam)</div></div>
        <div class="stat-box"><div class="val">720</div><div class="lbl">Pass Score /1000</div></div>
      </div>

      <div class="options-grid">
        <div>
          <span class="option-label">Number of Questions</span>
          <input type="number" id="qCount" value="65" min="5" max="1018" />
        </div>
        <div>
          <span class="option-label">Mode</span>
          <select id="quizMode">
            <option value="practice">Practice (see answers)</option>
            <option value="exam">Exam (answers at end)</option>
          </select>
        </div>
      </div>

      <div class="options-grid">
        <div>
          <span class="option-label">Order</span>
          <select id="orderMode">
            <option value="random">Random</option>
            <option value="sequential">Sequential (Q1 first)</option>
          </select>
        </div>
        <div>
          <span class="option-label">Timer</span>
          <select id="timerMode">
            <option value="none">No timer</option>
            <option value="exam">Exam pace (130 min)</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>
      <div id="customTimerRow" style="display:none; margin-bottom:16px;">
        <span class="option-label">Custom time (minutes)</span>
        <input type="number" id="customMinutes" value="30" min="1" max="300" />
      </div>

      <button class="btn btn-primary btn-block" id="startBtn" style="font-size:16px;padding:13px;">
        Start Quiz
      </button>
    </div>

    <div class="home-card" id="prevResultCard" style="display:none;">
      <h2>Previous Session</h2>
      <div id="prevResultText" style="font-size:14px;color:#57606a;margin-bottom:12px;"></div>
      <button class="btn btn-outline btn-sm" id="continueBtn">Continue Session</button>
    </div>
  </div>

  <!-- ========== QUIZ ========== -->
  <div id="quizScreen" style="display:none;">
    <div class="top-bar">
      <span class="timer" id="timerDisplay" style="display:none;">⏱ --:--</span>
      <div style="flex:1;"></div>
      <button class="btn btn-secondary btn-sm" id="flagBtn">🔖 Flag</button>
      <button class="btn btn-secondary btn-sm" id="quitBtn">✕ Quit</button>
    </div>

    <div class="prog-wrap"><div class="prog-bar" id="progBar" style="width:0%"></div></div>

    <div class="quiz-card">
      <div class="quiz-meta">
        <span class="q-label" id="qMeta">QUESTION 1 OF 65</span>
        <span class="q-num" id="qOrigNum">#1</span>
      </div>
      <div class="quiz-question" id="questionText"></div>
      <div class="opts" id="optsList"></div>
      <div class="feedback" id="feedbackBox"></div>
      <div class="quiz-actions">
        <button class="btn btn-primary" id="submitBtn">Submit Answer</button>
        <button class="btn btn-secondary" id="nextBtn" style="display:none;">Next →</button>
        <button class="btn btn-secondary btn-sm" id="skipBtn">Skip</button>
      </div>
    </div>

    <div style="text-align:center;margin-top:12px;">
      <span id="flaggedCount" style="font-size:12px;color:#57606a;"></span>
    </div>
  </div>

  <!-- ========== RESULTS ========== -->
  <div id="resultsScreen" style="display:none;">
    <div class="results-header">
      <div class="score-ring">
        <span class="pct" id="resPct">0%</span>
        <span class="raw" id="resRaw">0/0</span>
      </div>
      <div class="results-title" id="resTitle">Quiz Complete!</div>
      <div class="results-sub" id="resSub"></div>
      <div class="domain-breakdown" id="domainBreakdown"></div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:20px;">
        <button class="btn btn-primary" id="retryBtn">Retry Same</button>
        <button class="btn btn-outline" id="retryWrongBtn">Retry Wrong Only</button>
        <button class="btn btn-secondary" id="homeBtn">Home</button>
      </div>
    </div>
    <div class="review-section">
      <h2>Answer Review</h2>
      <div class="review-scroll"><div class="review-list" id="reviewList"></div></div>
    </div>
  </div>

</div>

<footer>AWS SAA-C03 Practice Quiz &nbsp;|&nbsp; 1,018 questions parsed from official exam PDF &nbsp;|&nbsp; Made with IBM Bob</footer>

<script>
// ---- All question data ----
const ALL_QUESTIONS = ${questionsJson};

// ---- Domain mapping (rough by question number groups) ----
function getDomain(q) {
  // SAA-C03 domain distribution by content keywords
  const text = q.question.toLowerCase();
  if (/secure|iam|kms|encrypt|secret|policy|permission|cognito|waf|shield|guard|macie|inspector/.test(text)) return 'Domain 1: Secure Architectures';
  if (/resilient|multi.az|failover|backup|recovery|rpo|rto|dr |disaster|replicate|replication|cross.region/.test(text)) return 'Domain 2: Resilient Architectures';
  if (/perform|latency|throughput|cache|elasticach|cloudfront|global accelerator|read replica|scale|auto scal/.test(text)) return 'Domain 3: High-Performing Architectures';
  if (/cost|budget|saving|reserved|spot|cheapest|least expensive|optimize|pricing/.test(text)) return 'Domain 4: Cost-Optimized Architectures';
  return 'Domain 2: Resilient Architectures';
}

// ---- State ----
let session = null;
let timerInterval = null;
let timeLeft = 0;

function saveSession() {
  try { localStorage.setItem('saa_session', JSON.stringify(session)); } catch(e){}
}
function loadSession() {
  try { const s = localStorage.getItem('saa_session'); return s ? JSON.parse(s) : null; } catch(e){ return null; }
}
function clearSession() {
  try { localStorage.removeItem('saa_session'); } catch(e){}
}

// ---- DOM refs ----
const homeScreen    = document.getElementById('homeScreen');
const quizScreen    = document.getElementById('quizScreen');
const resultsScreen = document.getElementById('resultsScreen');

// ---- Init ----
window.addEventListener('load', () => {
  const prev = loadSession();
  if (prev && prev.answers && prev.currentIdx < prev.questions.length) {
    document.getElementById('prevResultCard').style.display = '';
    document.getElementById('prevResultText').textContent =
      \`Question \${prev.currentIdx + 1} of \${prev.questions.length} — \${prev.score} correct so far\`;
    document.getElementById('continueBtn').addEventListener('click', () => {
      session = prev;
      showQuiz();
    });
  }
  document.getElementById('timerMode').addEventListener('change', () => {
    const v = document.getElementById('timerMode').value;
    document.getElementById('customTimerRow').style.display = v === 'custom' ? '' : 'none';
  });
  document.getElementById('startBtn').addEventListener('click', startQuiz);
});

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startQuiz() {
  const count  = Math.min(Math.max(parseInt(document.getElementById('qCount').value) || 65, 5), 1018);
  const mode   = document.getElementById('quizMode').value;
  const order  = document.getElementById('orderMode').value;
  const timer  = document.getElementById('timerMode').value;
  const custom = parseInt(document.getElementById('customMinutes').value) || 30;

  let pool = [...ALL_QUESTIONS];
  if (order === 'random') pool = shuffle(pool);
  else pool.sort((a,b) => a.num - b.num);

  const qs = pool.slice(0, count);

  session = {
    questions: qs,
    currentIdx: 0,
    answers: new Array(qs.length).fill(null),
    flagged: new Array(qs.length).fill(false),
    score: 0,
    mode,
    timer,
    customMins: custom,
    startTime: Date.now()
  };
  saveSession();
  showQuiz();
}

function showQuiz() {
  homeScreen.style.display    = 'none';
  quizScreen.style.display    = '';
  resultsScreen.style.display = 'none';

  // Setup timer
  if (timerInterval) clearInterval(timerInterval);
  const td = document.getElementById('timerDisplay');
  if (session.timer !== 'none') {
    const mins = session.timer === 'exam' ? 130 : session.customMins;
    const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
    timeLeft = Math.max(0, mins * 60 - elapsed);
    td.style.display = '';
    updateTimer();
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimer();
      if (timeLeft <= 0) { clearInterval(timerInterval); finishQuiz(); }
    }, 1000);
  } else {
    td.style.display = 'none';
  }

  renderQuestion();
}

function updateTimer() {
  const td = document.getElementById('timerDisplay');
  const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const s = String(timeLeft % 60).padStart(2, '0');
  td.textContent = \`⏱ \${m}:\${s}\`;
  td.className = 'timer' + (timeLeft < 120 ? ' warn' : '');
}

// Helper: is a stored answer "skipped"?
function isSkipped(ans) { return !ans || ans === 'skipped'; }
// Helper: is a stored answer correct for question q?
function isCorrect(q, ans) {
  if (isSkipped(ans)) return false;
  if (q.multiSelect) {
    const sel = Array.isArray(ans) ? ans : [ans];
    return sel.length === q.correctLetters.length &&
           q.correctLetters.every(l => sel.includes(l));
  }
  return q.correctLetters.includes(ans);
}

function renderQuestion() {
  const { questions, currentIdx, answers, flagged, mode } = session;
  const q = questions[currentIdx];
  const total = questions.length;

  document.getElementById('progBar').style.width = \`\${(currentIdx / total) * 100}%\`;
  document.getElementById('qMeta').textContent = \`QUESTION \${currentIdx + 1} OF \${total}\`;
  document.getElementById('qOrigNum').textContent = \`#\${q.num}\`;
  document.getElementById('questionText').textContent = q.question;

  // Multi-select hint
  let hintEl = document.getElementById('multiHint');
  if (!hintEl) {
    hintEl = document.createElement('div');
    hintEl.id = 'multiHint';
    document.getElementById('questionText').after(hintEl);
  }
  if (q.multiSelect) {
    hintEl.className = 'multi-hint';
    hintEl.textContent = \`Select \${q.correctLetters.length} answers\`;
    hintEl.style.display = '';
  } else {
    hintEl.style.display = 'none';
  }

  // Flag button
  const flagBtn = document.getElementById('flagBtn');
  flagBtn.textContent = flagged[currentIdx] ? '🔖 Flagged' : '🔖 Flag';
  flagBtn.className = flagged[currentIdx] ? 'btn btn-sm flag-btn flagged' : 'btn btn-sm flag-btn';

  // Flagged count
  const fc = session.flagged.filter(Boolean).length;
  document.getElementById('flaggedCount').textContent = fc > 0 ? \`\${fc} question\${fc > 1 ? 's' : ''} flagged\` : '';

  // Render options
  const optsList = document.getElementById('optsList');
  optsList.innerHTML = '';
  const prevAns = answers[currentIdx];
  const prevArr = Array.isArray(prevAns) ? prevAns : (prevAns && prevAns !== 'skipped' ? [prevAns] : []);
  const alreadyAnswered = prevAns !== null;

  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'opt';
    btn.dataset.letter = opt.letter;

    // Checkbox icon for multi-select, letter badge for single
    const checkHtml = q.multiSelect
      ? \`<span class="opt-check"></span>\`
      : \`\`;
    btn.innerHTML = \`\${checkHtml}<span class="opt-letter">\${opt.letter}.</span><span>\${escHtml(opt.text)}</span>\`;

    if (alreadyAnswered) {
      btn.disabled = true;
      const wasSelected = prevArr.includes(opt.letter);
      if (q.correctLetters.includes(opt.letter)) {
        btn.classList.add('correct');
        if (btn.querySelector('.opt-check')) btn.querySelector('.opt-check').textContent = '✓';
      } else if (wasSelected) {
        btn.classList.add('wrong');
        if (btn.querySelector('.opt-check')) btn.querySelector('.opt-check').textContent = '✗';
      }
    } else {
      btn.addEventListener('click', () => {
        if (q.multiSelect) {
          // Toggle selection for multi-select
          btn.classList.toggle('selected');
          const chk = btn.querySelector('.opt-check');
          if (chk) chk.textContent = btn.classList.contains('selected') ? '✓' : '';
        } else {
          // Single select — deselect others
          optsList.querySelectorAll('.opt').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        }
      });
    }
    optsList.appendChild(btn);

    // Re-apply selected state if navigating back (multi-select)
    if (!alreadyAnswered && q.multiSelect && Array.isArray(prevAns) && prevAns.includes(opt.letter)) {
      btn.classList.add('selected');
      const chk = btn.querySelector('.opt-check');
      if (chk) chk.textContent = '✓';
    }
  });

  // Feedback & buttons
  const feedbackBox = document.getElementById('feedbackBox');
  const submitBtn   = document.getElementById('submitBtn');
  const nextBtn     = document.getElementById('nextBtn');
  const skipBtn     = document.getElementById('skipBtn');

  if (alreadyAnswered && prevAns !== 'skipped') {
    const correct = isCorrect(q, prevAns);
    feedbackBox.style.display = '';
    feedbackBox.className = 'feedback ' + (correct ? 'correct' : 'wrong');
    feedbackBox.textContent = correct
      ? '✓ Correct!'
      : \`✗ Incorrect. Correct answer: \${q.correctLetters.join(', ')}\`;
    submitBtn.style.display = 'none';
    skipBtn.style.display   = 'none';
    nextBtn.style.display   = '';
    nextBtn.textContent     = currentIdx + 1 < total ? 'Next →' : 'See Results';
  } else if (prevAns === 'skipped') {
    feedbackBox.style.display = 'none';
    submitBtn.style.display = 'none';
    skipBtn.style.display = 'none';
    nextBtn.style.display = '';
    nextBtn.textContent = currentIdx + 1 < total ? 'Next →' : 'See Results';
  } else {
    feedbackBox.style.display = 'none';
    submitBtn.style.display = '';
    skipBtn.style.display   = '';
    nextBtn.style.display   = 'none';
  }
}

// Submit answer
document.getElementById('submitBtn').addEventListener('click', () => {
  const { questions, currentIdx, mode } = session;
  const q = questions[currentIdx];

  let answer;
  if (q.multiSelect) {
    const selectedBtns = document.querySelectorAll('.opt.selected');
    if (selectedBtns.length === 0) { alert('Please select at least one answer.'); return; }
    if (selectedBtns.length < q.correctLetters.length) {
      if (!confirm(\`This question requires \${q.correctLetters.length} answers. You selected \${selectedBtns.length}. Submit anyway?\`)) return;
    }
    answer = Array.from(selectedBtns).map(b => b.dataset.letter).sort();
  } else {
    const selected = document.querySelector('.opt.selected');
    if (!selected) { alert('Please select an answer.'); return; }
    answer = selected.dataset.letter;
  }

  session.answers[currentIdx] = answer;
  const correct = isCorrect(q, answer);
  if (correct) session.score++;
  saveSession();

  if (mode === 'exam') {
    document.getElementById('feedbackBox').style.display = 'none';
    document.getElementById('submitBtn').style.display   = 'none';
    document.getElementById('skipBtn').style.display     = 'none';
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.style.display = '';
    nextBtn.textContent = currentIdx + 1 < session.questions.length ? 'Next →' : 'See Results';
    return;
  }

  // Practice mode — reveal
  const feedbackBox = document.getElementById('feedbackBox');
  feedbackBox.style.display = '';
  feedbackBox.className = 'feedback ' + (correct ? 'correct' : 'wrong');
  feedbackBox.textContent = correct
    ? '✓ Correct!'
    : \`✗ Incorrect. Correct answer\${q.correctLetters.length > 1 ? 's' : ''}: \${q.correctLetters.join(', ')}\`;

  // Color options
  const ansArr = Array.isArray(answer) ? answer : [answer];
  document.querySelectorAll('.opt').forEach(btn => {
    btn.disabled = true;
    const l = btn.dataset.letter;
    const chk = btn.querySelector('.opt-check');
    if (q.correctLetters.includes(l)) {
      btn.classList.add('correct');
      if (chk) chk.textContent = '✓';
    } else if (ansArr.includes(l)) {
      btn.classList.add('wrong');
      if (chk) chk.textContent = '✗';
    }
  });

  document.getElementById('submitBtn').style.display = 'none';
  document.getElementById('skipBtn').style.display   = 'none';
  const nextBtn = document.getElementById('nextBtn');
  nextBtn.style.display = '';
  nextBtn.textContent = currentIdx + 1 < session.questions.length ? 'Next →' : 'See Results';
});

// Skip
document.getElementById('skipBtn').addEventListener('click', () => {
  session.answers[session.currentIdx] = 'skipped';
  saveSession();
  goNext();
});

// Next
document.getElementById('nextBtn').addEventListener('click', goNext);

function goNext() {
  session.currentIdx++;
  if (session.currentIdx >= session.questions.length) {
    finishQuiz();
  } else {
    saveSession();
    renderQuestion();
  }
}

// Flag
document.getElementById('flagBtn').addEventListener('click', () => {
  session.flagged[session.currentIdx] = !session.flagged[session.currentIdx];
  saveSession();
  renderQuestion();
});

// Quit
document.getElementById('quitBtn').addEventListener('click', () => {
  if (confirm('Quit and go to results?')) finishQuiz();
});

// ---- Finish ----
function finishQuiz() {
  if (timerInterval) clearInterval(timerInterval);
  clearSession();

  if (session.mode === 'exam') {
    // In exam mode, score all answers now
    session.score = 0;
    session.answers.forEach((ans, i) => {
      if (isCorrect(session.questions[i], ans)) session.score++;
    });
  }

  quizScreen.style.display    = 'none';
  resultsScreen.style.display = '';

  const total     = session.questions.length;
  const answered  = session.answers.filter(a => a && a !== 'skipped').length;
  const skipped   = session.answers.filter(a => a === 'skipped').length;
  const nulled    = session.answers.filter(a => a === null).length;
  const score     = session.score;
  const pct       = Math.round((score / total) * 100);
  const passMark  = 72; // ~720/1000

  document.getElementById('resPct').textContent = pct + '%';
  document.getElementById('resRaw').textContent = \`\${score}/\${total}\`;

  let title, sub;
  if (pct >= 90)       { title = 'Outstanding! 🏆'; }
  else if (pct >= passMark) { title = 'Passed! 👍'; }
  else if (pct >= 50)  { title = 'Almost There 📚'; }
  else                 { title = 'Keep Studying 💪'; }

  sub = \`Score: \${score}/\${total} (\${pct}%) &nbsp;|&nbsp; Answered: \${answered} &nbsp;|&nbsp; Skipped: \${skipped + nulled}\`;
  if (pct >= passMark) sub += \` &nbsp;|&nbsp; ✅ Above pass mark (\${passMark}%)\`;
  else sub += \` &nbsp;|&nbsp; ❌ Below pass mark (\${passMark}%)\`;

  document.getElementById('resTitle').textContent = title;
  document.getElementById('resSub').innerHTML = sub;

  // Domain breakdown
  const domains = {};
  session.questions.forEach((q, i) => {
    const d = getDomain(q);
    if (!domains[d]) domains[d] = { correct: 0, total: 0 };
    domains[d].total++;
    const ans = session.answers[i];
    if (isCorrect(q, ans)) domains[d].correct++;
  });
  const dbEl = document.getElementById('domainBreakdown');
  dbEl.innerHTML = Object.entries(domains).map(([name, v]) => {
    const p = Math.round((v.correct / v.total) * 100);
    return \`<div class="db-card">
      <div class="db-name">\${name}</div>
      <div class="db-bar-wrap"><div class="db-bar" style="width:\${p}%"></div></div>
      <div class="db-score">\${v.correct}/\${v.total} (\${p}%)</div>
    </div>\`;
  }).join('');

  // Review list
  const reviewList = document.getElementById('reviewList');
  reviewList.innerHTML = '';
  session.questions.forEach((q, i) => {
    const ans      = session.answers[i];
    const skipped  = isSkipped(ans);
    const correct  = isCorrect(q, ans);
    const cls      = skipped ? 'rv rv-skip' : correct ? 'rv rv-ok' : 'rv rv-bad';
    const badge    = skipped ? '<span class="rv-badge skip">Skipped</span>'
                   : correct ? '<span class="rv-badge ok">Correct</span>'
                   :           '<span class="rv-badge bad">Wrong</span>';
    const multiTag = q.multiSelect ? '<span style="font-size:11px;color:#7c5cd8;background:#f3f0ff;border:1px solid #d8b4fe;border-radius:4px;padding:1px 7px;margin-left:6px;">Multi</span>' : '';

    // Format user answer display
    const ansDisplay = Array.isArray(ans) ? ans.join(', ') : (ans || '—');

    // Find correct option text
    const correctOpts = q.options.filter(o => q.correctLetters.includes(o.letter));
    const correctText = correctOpts.map(o => \`\${o.letter}. \${o.text}\`).join(' | ');

    const div = document.createElement('div');
    div.className = cls;
    div.innerHTML = \`
      \${badge}\${multiTag}
      <div class="rv-q">Q\${q.num}. \${escHtml(q.question.slice(0, 140))}\${q.question.length > 140 ? '…' : ''}</div>
      \${!skipped ? \`<div class="rv-ans">Your answer: <strong>\${escHtml(ansDisplay)}</strong></div>\` : ''}
      \${!correct ? \`<div class="rv-correct">Correct: <strong>\${escHtml(correctText)}</strong></div>\` : ''}
    \`;
    reviewList.appendChild(div);
  });
}

// Retry buttons
document.getElementById('retryBtn').addEventListener('click', () => {
  session.currentIdx = 0;
  session.score = 0;
  session.answers = new Array(session.questions.length).fill(null);
  session.flagged = new Array(session.questions.length).fill(false);
  session.startTime = Date.now();
  showQuiz();
});

document.getElementById('retryWrongBtn').addEventListener('click', () => {
  const wrongQs = session.questions.filter((q, i) => {
    return !isCorrect(q, session.answers[i]);
  });
  if (wrongQs.length === 0) { alert('No wrong answers! Perfect score!'); return; }
  session.questions = wrongQs;
  session.currentIdx = 0;
  session.score = 0;
  session.answers = new Array(wrongQs.length).fill(null);
  session.flagged = new Array(wrongQs.length).fill(false);
  session.startTime = Date.now();
  showQuiz();
});

document.getElementById('homeBtn').addEventListener('click', () => {
  resultsScreen.style.display = 'none';
  homeScreen.style.display = '';
  document.getElementById('prevResultCard').style.display = 'none';
});

// ---- Utility ----
function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
</script>
</body>
</html>`;

writeFileSync('./SAA-C03_Quiz.html', html, 'utf8');
console.log('HTML file written: SAA-C03_Quiz.html');
console.log('File size:', Math.round(html.length / 1024), 'KB');
