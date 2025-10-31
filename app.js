// عناصر التحكم بالواجهة
const howBtn = document.getElementById('howBtn');
const statsBtn = document.getElementById('statsBtn');
const settingsBtn = document.getElementById('settingsBtn');
const howModal = document.getElementById('howModal');
const statsModal = document.getElementById('statsModal');
const settingsModal = document.getElementById('settingsModal');

const closeBtns = document.querySelectorAll('.closeBtn');

const startBtn = document.getElementById('startBtn');
const downloadBtn = document.getElementById('downloadBtn');
const gameTitle = document.getElementById('gameTitle');
const gameArea = document.getElementById('gameArea');

const modeSelect = document.getElementById('modeSelect');
const difficulty = document.getElementById('difficulty');
const themeToggle = document.getElementById('themeToggle');

const friendBox = document.getElementById('friendBox');
const friendWord = document.getElementById('friendWord');
const setFriendBtn = document.getElementById('setFriendBtn');

const gridEl = document.getElementById('grid');
const guessInput = document.getElementById('guess');
const submitBtn = document.getElementById('submitBtn');
const restartBtn = document.getElementById('restartBtn');
const statusEl = document.getElementById('status');

// إحصائيات
const gamesPlayedEl = document.getElementById('gamesPlayed');
const winsEl = document.getElementById('wins');
const lossesEl = document.getElementById('losses');

let words = [], wordsByLen = { 3: [], 4: [], 5: [] };
let target = '', row = 0, wordLength = 5;
const maxAttempts = 6;
let isFriendMode = false;
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
}

function startGame() {
  isFriendMode = false;
  friendBox.classList.add('hidden');
  wordLength = parseInt(difficulty.value);
  const pool = wordsByLen[wordLength];
  if (!pool?.length) {
    alert(`لا توجد كلمات بطول ${wordLength} أحرف`);
    return;
  }
  target = pool[Math.floor(Math.random() * pool.length)];
  row = 0;
  createGrid();
  restartBtn.style.display = 'none';
  statusEl.textContent = '🎯 اللعبة بدأت!';
  localStorage.setItem('currentGame', JSON.stringify({ target, row, wordLength }));
}

function friendMode() {
  friendBox.classList.remove('hidden');
  wordLength = 0;
  target = '';
  createGrid();
  restartBtn.style.display = 'none';
  statusEl.textContent = '';
}

modeSelect.onchange = () => {
  if (modeSelect.value === 'friends') friendMode();
  else friendBox.classList.add('hidden');
}

setFriendBtn.onclick = () => {
  const w = friendWord.value.trim();
  if (w.length < 3 || w.length > 5) { alert('الكلمة بين 3 و5 أحرف'); return; }
  target = w;
  wordLength = w.length;
  friendBox.classList.add('hidden');
  row = 0;
  createGrid();
  statusEl.textContent = 'الكلمة محفوظة — ابدأ التخمين';
  friendWord.value = '';
}

submitBtn.onclick = () => {
  if (!target) return alert('ابدأ اللعبة أولاً');
  const guess = guessInput.value.trim();
  if (guess.length !== wordLength) return alert(`أدخل كلمة من ${wordLength} أحرف`);

  const cells = document.querySelectorAll('.cell');
  for (let i = 0; i < wordLength; i++) {
    const cell = cells[row * wordLength + i];
    cell.textContent = guess[i];
    cell.className = 'cell'; // إزالة أصناف قديمة
    if (guess[i] === target[i]) cell.classList.add('correct');
    else if (target.includes(guess[i])) cell.classList.add('present');
    else cell.classList.add('absent');
  }

  setTimeout(() => {
    if (guess === target) {
      stats.games++; stats.wins++;
      restartBtn.style.display = 'inline-block';
      statusEl.textContent = '🎉 فزت!';
      saveStats();
      updateStatsDisplay();
    } else if(row === maxAttempts -1) {
      stats.games++; stats.losses++;
      statusEl.textContent = '💀 انتهت المحاولات! الكلمة كانت: ' + target;
      restartBtn.style.display = 'inline-block';
      saveStats();
      updateStatsDisplay();
    } else {
      row++;
      statusEl.textContent = `تبقى ${maxAttempts-row} محاولات`;
    }
    guessInput.value = '';
    localStorage.setItem('currentGame', JSON.stringify({ target, row, wordLength }));
  }, 500);
}

restartBtn.onclick = () => {
  startGame();
  restartBtn.style.display = 'none';
  guessInput.value = '';
  statusEl.textContent = '';
}

// تبديل الوضع الليلي
themeToggle.onchange = e => {
  if(e.target.checked) {
    document.documentElement.setAttribute('data-theme','dark');
  } else {
    document.documentElement.setAttribute('data-theme','light');
  }
};

// أزرار الواجهة الرئيسية للنوافذ
howBtn.onclick = () => howModal.classList.add('active');
statsBtn.onclick = () => statsModal.classList.add('active');
settingsBtn.onclick = () => settingsModal.classList.add('active');

document.querySelectorAll('.closeBtn').forEach(btn=> {
  btn.onclick = () => btn.closest('.modal').classList.remove('active');
});

[howModal, statsModal, settingsModal].forEach(modal => {
  modal.onclick = e => {
    if(e.target === modal) modal.classList.remove('active');
  }
});

startBtn.onclick = () => {
  gameTitle.style.display = 'none';
  startBtn.style.display = 'none';
  downloadBtn.style.display = 'none';
  gameArea.classList.remove('hidden');
  if(modeSelect.value === 'friends') {
    friendMode();
  } else {
    startGame();
  }
}

downloadBtn.onclick = () => alert('ضع هنا رابط تحميل اللعبة');

// تحميل الكلمات وتهيئة اللعبة
loadWords();
updateStatsDisplay();
