// 🌙 الوضع الليلي
const themeToggle = document.getElementById('themeToggle');
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
  themeToggle.textContent = (t === 'dark') ? '☀️' : '🌙';
}
applyTheme(localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
themeToggle.onclick = () => applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');

// 🎮 العناصر
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

// 🪄 إظهار / إخفاء نافذة كيف تلعب
howBtn.onclick = () => howModal.style.display = 'flex';
closeHow.onclick = () => howModal.style.display = 'none';
howModal.onclick = e => { if (e.target === howModal) howModal.style.display = 'none'; };

// 📘 القاموس
let words = [], wordsByLen = { 3: [], 4: [], 5: [] };
let target = '', row = 0, wordLength = 5;
const maxAttempts = 6;
let isFriendMode = false;

// تحميل الكلمات من الملف
async function loadWords() {
  try {
    const r = await fetch('Arabic_words.txt');
    const txt = await r.text();
    const arr = txt.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    words = arr;
    wordsByLen[3] = arr.filter(w => w.length === 3);
    wordsByLen[4] = arr.filter(w => w.length === 4);
    wordsByLen[5] = arr.filter(w => w.length === 5);
  } catch (e) {
    statusEl.textContent = '❌ لم يتم العثور على ملف الكلمات';
  }
}

// 🧩 إنشاء الشبكة
function createGrid() {
  gridEl.innerHTML = '';
  gridEl.style.gridTemplateColumns = `repeat(${wordLength}, 60px)`;
  for (let i = 0; i < wordLength * maxAttempts; i++) {
    const d = document.createElement('div');
    d.className = 'cell';
    gridEl.appendChild(d);
  }
}

// 🕹️ بدء اللعبة
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
  statusEl.textContent = '';
}

// 🎯 وضع الأصدقاء
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
  statusEl.textContent = 'ابدأ التخمين الآن';
  friendWord.value = '';
}

// ✅ إرسال التخمين
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
    }, 100);
  } else if (row === maxAttempts - 1) {
    setTimeout(() => {
      alert('💀 انتهت المحاولات! الكلمة كانت: ' + target);
      restartBtn.style.display = 'inline-block';
    }, 100);
  } else {
    row++;
  }
  guessInput.value = '';
}

// 🔁 إعادة اللعبة بكلمة جديدة
function restartGame() {
  if (isFriendMode) {
    friendBox.style.display = 'block';
    gridEl.innerHTML = '';
    restartBtn.style.display = 'none';
    target = '';
  } else {
    const pool = wordsByLen[wordLength];
    target = pool[Math.floor(Math.random() * pool.length)];
    row = 0;
    createGrid();
    restartBtn.style.display = 'none';
  }
}

// ✅ منع ظهور لوحة المفاتيح (على الهاتف)
guessInput.setAttribute('readonly', true);
guessInput.addEventListener('focus', e => e.target.blur());

// ⚙️ الأحداث
startBtn.onclick = startGame;
submitBtn.onclick = submitGuess;
restartBtn.onclick = restartGame;
modeSelect.onchange = () => {
  if (modeSelect.value === 'friends') friendMode();
  else friendBox.style.display = 'none';
};
setFriendBtn.onclick = setFriend;

// 🔤 تحميل القاموس
loadWords();

// 📲 كود تثبيت اللعبة (PWA)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const installBtn = document.createElement('button');
  installBtn.textContent = '📲 تثبيت اللعبة';
  installBtn.className = 'install-btn';
  document.body.appendChild(installBtn);

  installBtn.addEventListener('click', async () => {
    installBtn.remove();
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') console.log('تم تثبيت اللعبة ✅');
    deferredPrompt = null;
  });
});
