// الوضع الليلي
const themeToggle = document.getElementById('themeToggle');
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
  themeToggle.textContent = (t === 'dark') ? '☀️' : '🌙';
}
applyTheme(localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
themeToggle.onclick = () => applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');

// العناصر
const startBtn = document.getElementById('startBtn');
const howBtn = document.getElementById('howBtn');
const howModal = document.getElementById('howModal');
const closeHow = document.getElementById('closeHow');
const gridEl = document.getElementById('grid');
const guessInput = document.getElementById('guess');
const submitBtn = document.getElementById('submitBtn');
const restartBtn = document.getElementById('restartBtn');
const statusEl = document.getElementById('status');
const modeSelect = document.getElementById('modeSelect');
const difficulty = document.getElementById('difficulty');
const diffBox = document.getElementById('diffBox');
const friendBox = document.getElementById('friendBox');
const friendWord = document.getElementById('friendWord');
const setFriendBtn = document.getElementById('setFriendBtn');

const gamesPlayedEl = document.getElementById('gamesPlayed');
const winsEl = document.getElementById('wins');
const lossesEl = document.getElementById('losses');

howBtn.onclick = () => howModal.style.display = 'flex';
closeHow.onclick = () => howModal.style.display = 'none';
howModal.onclick = e => { if (e.target === howModal) howModal.style.display = 'none'; };

// القاموس
let words = [], wordsByLen = { 3: [], 4: [], 5: [] };
let target = '', row = 0, wordLength = 5;
const maxAttempts = 6;
let isFriendMode = false;

// الإحصائيات
let stats = JSON.parse(localStorage.getItem('stats') || '{"games":0,"wins":0,"losses":0}');
function updateStatsDisplay() {
  gamesPlayedEl.textContent = stats.games;
  winsEl.textContent = stats.wins;
  lossesEl.textContent = stats.losses;
}
updateStatsDisplay();

function saveStats() {
  localStorage.setItem('stats', JSON.stringify(stats));
}

async function loadWords() {
  try {
    const r = await fetch('arabic_words.txt');
    const txt = await r.text();
    const arr = txt.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    words = arr;
    wordsByLen[3] = arr.filter(w => w.length === 3);
    wordsByLen[4] = arr.filter(w => w.length === 4);
    wordsByLen[5] = arr.filter(w => w.length === 5);
  } catch {
    statusEl.textContent = '❌ لم يتم العثور على arabic_words.txt';
  }
}

function createGrid() {
  gridEl.innerHTML = '';
  gridEl.style.gridTemplateColumns = `repeat(${wordLength}, 60px)`;
  for (let i = 0; i < wordLength * maxAttempts; i++) {
    const d = document.createElement('div');
    d.className = 'cell';
    gridEl.appendChild(d);
  }
  gridEl.setAttribute('aria-hidden', 'false');
}

function startGame() {
  isFriendMode = false;
  friendBox.style.display = 'none';
  diffBox.style.display = 'inline-block';
  wordLength = parseInt(difficulty.value);
  const pool = wordsByLen[wordLength];
  if (!pool?.length) {
    statusEl.textContent = `لا توجد كلمات بطول ${wordLength} أحرف`;
    return;
  }
  target = pool[Math.floor(Math.random() * pool.length)];
  row = 0;
  createGrid();
  restartBtn.style.display = 'none';
  statusEl.style.display = 'block';
  statusEl.textContent = '🎯 اللعبة بدأت!';
  localStorage.setItem('currentGame', JSON.stringify({ target, row, wordLength }));
}

function friendMode() {
  friendBox.style.display = 'block';
  diffBox.style.display = 'none';
  gridEl.innerHTML = '';
  restartBtn.style.display = 'none';
  target = '';
  isFriendMode = true;
}

function setFriend() {
  const w = friendWord.value.trim();
  if (w.length < 3 || w.length > 5) { alert('الكلمة بين 3 و5 أحرف'); return; }
  target = w;
  wordLength = w.length;
  friendBox.style.display = 'none';
  row = 0;
  createGrid();
  statusEl.textContent = 'الكلمة محفوظة — ابدأ التخمين';
  friendWord.value = '';
}

function submitGuess() {
  if (!target) return alert('ابدأ اللعبة أولاً');
  const g = guessInput.value.trim();
  if (g.length !== wordLength) return alert(`أدخل كلمة من ${wordLength} أحرف`);

  const cells = document.querySelectorAll('.cell');
  for (let i = 0; i < wordLength; i++) {
    const cell = cells[row * wordLength + i];
    cell.textContent = g[i];
    if (g[i] === target[i]) cell.classList.add('correct');
    else if (target.includes(g[i])) cell.classList.add('present');
    else cell.classList.add('absent');
  }

  if (g === target) {
    stats.games++; stats.wins++; saveStats(); updateStatsDisplay();
    setTimeout(() => {
      alert('🎉 أحسنت! الكلمة صحيحة');
      restartBtn.style.display = 'inline-block';
      statusEl.textContent = 'فزت!';
    }, 100);
  } else if (row === maxAttempts - 1) {
    stats.games++; stats.losses++; saveStats(); updateStatsDisplay();
    setTimeout(() => {
      alert('💀 انتهت المحاولات! الكلمة كانت: ' + target);
      restartBtn.style.display = 'inline-block';
      statusEl.textContent = 'انتهت المحاولات';
    }, 100);
  } else {
    row++;
    statusEl.textContent = `تبقى ${maxAttempts - row} محاولات`;
  }
  guessInput.value = '';
  localStorage.setItem('currentGame', JSON.stringify({ target, row, wordLength }));
}

function restartGame() {
  localStorage.removeItem('currentGame');
  if (isFriendMode) {
    friendMode();
  } else {
    startGame();
  }
}

startBtn.onclick = startGame;
submitBtn.onclick = submitGuess;
restartBtn.onclick = restartGame;
modeSelect.onchange = () => {
  if (modeSelect.value === 'friends') friendMode();
  else { friendBox.style.display = 'none'; diffBox.style.display = 'inline-block'; }
};
setFriendBtn.onclick = setFriend;

loadWords();
updateStatsDisplay();

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
