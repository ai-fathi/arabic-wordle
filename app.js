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
const friendBox = document.getElementById('friendBox');
const friendWord = document.getElementById('friendWord');
const setFriendBtn = document.getElementById('setFriendBtn');

howBtn.onclick = () => howModal.style.display = 'flex';
closeHow.onclick = () => howModal.style.display = 'none';
howModal.onclick = e => { if (e.target === howModal) howModal.style.display = 'none'; };

// القاموس
let words = [], wordsByLen = { 3: [], 4: [], 5: [] };
let target = '', row = 0, wordLength = 5;
const maxAttempts = 6;
let isFriendMode = false;

async function loadWords() {
  try {
    const r = await fetch('Arabic_words.txt');
    const txt = await r.text();
    const arr = txt.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    words = arr;
    wordsByLen[3] = arr.filter(w => w.length === 3);
    wordsByLen[4] = arr.filter(w => w.length === 4);
    wordsByLen[5] = arr.filter(w => w.length === 5);
    // ✅ أزلنا رسالة "القاموس محمل"
  } catch (e) {
    statusEl.textContent = '❌ لم يتم العثور على Arabic_words.txt';
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
}

function startGame() {
  isFriendMode = false;
  friendBox.style.display = 'none';
  wordLength = parseInt(difficulty.value);
  const pool = wordsByLen[wordLength];
  if (!pool || pool.length === 0) {
    statusEl.textContent = `لا توجد كلمات بطول ${wordLength} أحرف`;
    target = '';
    return;
  }
  target = pool[Math.floor(Math.random() * pool.length)];
  row = 0;
  createGrid();
  restartBtn.style.display = 'none';
  statusEl.textContent = '🎯 اللعبة بدأت!';
}

function friendMode() {
  friendBox.style.display = 'block';
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
  difficulty.value = String(wordLength);
  friendBox.style.display = 'none';
  row = 0;
  createGrid();
  statusEl.textContent = 'الكلمة محفوظة — ابدأ التخمين';
  friendWord.value = '';
}

function submitGuess() {
  if (!target) { alert('ابدأ اللعبة أولاً'); return; }
  const g = guessInput.value.trim();
  if (g.length !== wordLength) { alert(`أدخل كلمة من ${wordLength} أحرف`); return; }

  const cells = document.querySelectorAll('.cell');
  for (let i = 0; i < wordLength; i++) {
    const cell = cells[row * wordLength + i];
    cell.textContent = g[i];
    if (g[i] === target[i]) cell.classList.add('correct');
    else if (target.includes(g[i])) cell.classList.add('present');
    else cell.classList.add('absent');
  }

  if (g === target) {
    setTimeout(() => {
      alert('🎉 أحسنت! الكلمة صحيحة');
      restartBtn.style.display = 'inline-block';
      statusEl.textContent = 'فزت!';
    }, 100);
  } else if (row === maxAttempts - 1) {
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
}

function restartGame() {
  if (isFriendMode) {
    friendBox.style.display = 'block';
    gridEl.innerHTML = '';
    restartBtn.style.display = 'none';
    target = '';
  } else {
    const pool = wordsByLen[wordLength];
    target = pool[Math.floor(Math.random() * pool.length)]; // ✅ كلمة جديدة كل مرة
    row = 0;
    createGrid();
    restartBtn.style.display = 'none';
    statusEl.textContent = '🎮 لعبة جديدة — حظًا موفقًا!';
  }
}

startBtn.onclick = startGame;
submitBtn.onclick = submitGuess;
restartBtn.onclick = restartGame;
modeSelect.onchange = () => {
  if (modeSelect.value === 'friends') friendMode();
  else friendBox.style.display = 'none';
};
setFriendBtn.onclick = setFriend;

loadWords();