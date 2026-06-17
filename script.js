// ===== STAR CANVAS =====
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let stars = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initStars() {
  stars = [];
  for (let i = 0; i < 160; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.7 + 0.1,
      speed: Math.random() * 0.15 + 0.03,
      twinkle: Math.random() * Math.PI * 2,
    });
  }
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(s => {
    s.twinkle += 0.02;
    const a = s.alpha * (0.6 + 0.4 * Math.sin(s.twinkle));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 180, 255, ${a})`;
    ctx.fill();
    s.y -= s.speed;
    if (s.y < -5) { s.y = canvas.height + 5; s.x = Math.random() * canvas.width; }
  });
  requestAnimationFrame(drawStars);
}

resize();
initStars();
drawStars();
window.addEventListener('resize', () => { resize(); initStars(); });

// ===== TYPEWRITER =====
const roles = [
  'Fullstack Apps.',
  'AI Pipelines.',
  'Python Games.',
  'Cloud Systems.',
  'Automation Bots.',
];
let roleIdx = 0, charIdx = 0, deleting = false;
const tw = document.getElementById('typewriter');

function type() {
  const current = roles[roleIdx];
  if (!deleting) {
    tw.textContent = current.slice(0, charIdx + 1);
    charIdx++;
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(type, 1800);
      return;
    }
    setTimeout(type, 80);
  } else {
    tw.textContent = current.slice(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      setTimeout(type, 300);
      return;
    }
    setTimeout(type, 45);
  }
}
setTimeout(type, 800);

// ===== NAV SCROLL =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// ===== HAMBURGER =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
function closeMobile() { mobileMenu.classList.remove('open'); }

// ===== PROJECT FILTER =====
const filterBtns = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    cards.forEach(card => {
      const match = filter === 'all' || card.dataset.cat === filter;
      card.classList.toggle('hidden', !match);
    });
  });
});

// ===== SCROLL REVEAL =====
const observer = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  }),
  { threshold: 0.1 }
);

document.querySelectorAll('.project-card, .tl-item, .skill-group, .cert-card, .contact-card, .section-header').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

// ===== SMOOTH ACTIVE NAV =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.style.color = '#fff';
          }
        });
      }
    });
  },
  { rootMargin: '-50% 0px -50% 0px' }
);
sections.forEach(s => sectionObserver.observe(s));

// ===== GAME ENGINE =====
const overlay    = document.getElementById('gameOverlay');
const gameCanvas = document.getElementById('gameCanvas');
const gc         = gameCanvas.getContext('2d');
let scoreEl      = document.getElementById('scoreDisplay');
function refreshScoreEl() { scoreEl = document.getElementById('scoreDisplay'); }
const gameTitle  = document.getElementById('gameTitle');
const gameHint   = document.getElementById('gameHint');

let activeGame = null;
let gameLoop   = null;

function openGame(type) {
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  activeGame = type;
  document.getElementById('quizInputRow').style.display = type === 'quiz' ? 'flex' : 'none';
  document.getElementById('dpad').style.display = type === 'quiz' ? 'none' : '';
  document.getElementById('scoreLabel').innerHTML = 'Score: <span id="scoreDisplay">0</span>';
  refreshScoreEl();
  if (type === 'snake') initSnake();
  else if (type === 'pong') initPong();
  else initQuiz();
}

function closeGame(e) {
  if (e && e.target !== overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  if (gameLoop) { clearInterval(gameLoop); cancelAnimationFrame(gameLoop); gameLoop = null; }
  if (quizTimer) { clearInterval(quizTimer); quizTimer = null; }
  document.getElementById('quizInputRow').style.display = 'none';
  activeGame = null;
}

function restartGame() {
  if (gameLoop) { clearInterval(gameLoop); cancelAnimationFrame(gameLoop); gameLoop = null; }
  if (quizTimer) { clearInterval(quizTimer); quizTimer = null; }
  document.getElementById('scoreLabel').innerHTML = 'Score: <span id="scoreDisplay">0</span>';
  refreshScoreEl();
  if (activeGame === 'snake') initSnake();
  else if (activeGame === 'pong') initPong();
  else if (activeGame === 'quiz') initQuiz();
}

// ─── SNAKE ───────────────────────────────────────────────
const CELL = 20;
let snakeState = {};

function initSnake() {
  gameTitle.textContent = '🐍 Snake';
  gameHint.textContent  = 'Arrow keys / WASD to move';
  const size = Math.min(500, Math.floor((window.innerWidth * 0.92) / CELL) * CELL);
  gameCanvas.width  = size;
  gameCanvas.height = size;
  const cols = size / CELL, rows = size / CELL;
  snakeState = {
    cols, rows,
    snake: [{x: Math.floor(cols/2), y: Math.floor(rows/2)}],
    dir: {x:1, y:0}, nextDir: {x:1, y:0},
    food: randomFood(cols, rows, [{x: Math.floor(cols/2), y: Math.floor(rows/2)}]),
    score: 0, speed: 130, over: false,
  };
  scoreEl.textContent = '0';
  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(stepSnake, snakeState.speed);
}

function randomFood(cols, rows, snake) {
  let pos;
  do { pos = {x: Math.floor(Math.random()*cols), y: Math.floor(Math.random()*rows)}; }
  while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

function stepSnake() {
  const s = snakeState;
  if (s.over) return;
  s.dir = {...s.nextDir};
  const head = {x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y};

  if (head.x < 0 || head.x >= s.cols || head.y < 0 || head.y >= s.rows ||
      s.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
    s.over = true; drawSnake(); return;
  }

  s.snake.unshift(head);
  if (head.x === s.food.x && head.y === s.food.y) {
    s.score += 10;
    scoreEl.textContent = s.score;
    s.food = randomFood(s.cols, s.rows, s.snake);
    if (s.score % 50 === 0) {
      clearInterval(gameLoop);
      s.speed = Math.max(60, s.speed - 10);
      gameLoop = setInterval(stepSnake, s.speed);
    }
  } else {
    s.snake.pop();
  }
  drawSnake();
}

function drawSnake() {
  const s = snakeState;
  const W = gameCanvas.width, H = gameCanvas.height;
  gc.fillStyle = '#0d0d1a'; gc.fillRect(0,0,W,H);

  // Grid dots
  gc.fillStyle = 'rgba(255,255,255,0.03)';
  for (let x=0; x<s.cols; x++) for (let y=0; y<s.rows; y++) {
    gc.fillRect(x*CELL+CELL/2-1, y*CELL+CELL/2-1, 2, 2);
  }

  // Food
  gc.fillStyle = '#ef4444';
  gc.shadowColor = '#ef4444'; gc.shadowBlur = 12;
  gc.beginPath();
  gc.arc(s.food.x*CELL+CELL/2, s.food.y*CELL+CELL/2, CELL/2-2, 0, Math.PI*2);
  gc.fill();
  gc.shadowBlur = 0;

  // Snake
  s.snake.forEach((seg, i) => {
    const ratio = 1 - i / s.snake.length;
    gc.fillStyle = i === 0 ? '#10b981'
      : `hsl(${160 - i*2}, ${70+ratio*30}%, ${40+ratio*20}%)`;
    gc.shadowColor = i === 0 ? '#10b981' : 'transparent';
    gc.shadowBlur  = i === 0 ? 10 : 0;
    const pad = i === 0 ? 1 : 2;
    gc.beginPath();
    gc.roundRect(seg.x*CELL+pad, seg.y*CELL+pad, CELL-pad*2, CELL-pad*2, 4);
    gc.fill();
  });
  gc.shadowBlur = 0;

  // Game over
  if (s.over) {
    gc.fillStyle = 'rgba(0,0,0,0.65)'; gc.fillRect(0,0,W,H);
    gc.fillStyle = '#fff'; gc.textAlign = 'center';
    gc.font = 'bold 28px Inter'; gc.fillText('Game Over', W/2, H/2-20);
    gc.font = '16px Inter'; gc.fillStyle = '#94a3b8';
    gc.fillText(`Score: ${s.score}  —  Press ↺ to restart`, W/2, H/2+16);
  }
}

// ─── PONG ────────────────────────────────────────────────
let pongState = {};
let pongRAF   = null;

function initPong() {
  gameTitle.textContent = '🏓 Pong';
  gameHint.textContent  = 'W/S — move paddle  |  vs Bot';
  const W = Math.min(640, Math.floor(window.innerWidth * 0.92));
  const H = Math.round(W * 0.6);
  gameCanvas.width = W; gameCanvas.height = H;
  const PH = H * 0.22, PW = W * 0.022;
  pongState = {
    W, H, PW, PH,
    ball: { x: W/2, y: H/2, vx: W*0.007*(Math.random()>0.5?1:-1), vy: H*0.007*(Math.random()>0.5?1:-1), r: W*0.016 },
    player: { y: H/2 - PH/2, score: 0, vy: 0 },
    ai:     { y: H/2 - PH/2, score: 0 },
    speed: W*0.007,
    over: false, winner: '',
    keys: {},
  };
  scoreEl.textContent = '0';
  if (pongRAF) cancelAnimationFrame(pongRAF);
  if (gameLoop) clearInterval(gameLoop);
  gameLoop = null;
  pongLoop();
}

function pongLoop() {
  stepPong();
  drawPong();
  if (!pongState.over) pongRAF = requestAnimationFrame(pongLoop);
}

function stepPong() {
  const p = pongState;
  const {W, H, PW, PH} = p;
  const b = p.ball, pl = p.player, ai = p.ai;

  // Player movement
  if (p.keys['w'] || p.keys['W'] || p.keys['ArrowUp'])   pl.y -= H * 0.012;
  if (p.keys['s'] || p.keys['S'] || p.keys['ArrowDown']) pl.y += H * 0.012;
  pl.y = Math.max(0, Math.min(H - PH, pl.y));

  // AI movement (tracks ball with slight lag)
  const aiCenter = ai.y + PH/2;
  const aiSpeed  = H * 0.009;
  if (aiCenter < b.y - 5) ai.y += aiSpeed;
  else if (aiCenter > b.y + 5) ai.y -= aiSpeed;
  ai.y = Math.max(0, Math.min(H - PH, ai.y));

  // Ball movement
  b.x += b.vx; b.y += b.vy;

  // Top/bottom bounce
  if (b.y - b.r <= 0) { b.y = b.r; b.vy = Math.abs(b.vy); }
  if (b.y + b.r >= H) { b.y = H - b.r; b.vy = -Math.abs(b.vy); }

  // Player paddle (left side, x = PW)
  if (b.x - b.r <= PW*2 && b.y >= pl.y && b.y <= pl.y+PH && b.vx < 0) {
    b.vx = Math.abs(b.vx) * 1.05;
    b.vy += ((b.y - (pl.y+PH/2)) / (PH/2)) * Math.abs(b.vx) * 0.4;
    b.x = PW*2 + b.r;
    const mx = W * 0.018; b.vx = Math.min(b.vx, mx); b.vy = Math.max(-mx, Math.min(mx, b.vy));
    p.player.score += 1; scoreEl.textContent = p.player.score;
  }

  // AI paddle (right side, x = W - PW)
  if (b.x + b.r >= W-PW*2 && b.y >= ai.y && b.y <= ai.y+PH && b.vx > 0) {
    b.vx = -Math.abs(b.vx) * 1.05;
    b.vy += ((b.y - (ai.y+PH/2)) / (PH/2)) * Math.abs(b.vx) * 0.4;
    b.x = W-PW*2 - b.r;
    const mx = W * 0.018; b.vx = Math.max(b.vx, -mx); b.vy = Math.max(-mx, Math.min(mx, b.vy));
  }

  // Score
  if (b.x < 0) { p.winner = '🤖 Bot Wins!'; p.over = true; }
  if (b.x > W) { p.winner = '🎉 You Win!'; p.over = true; }
}

function drawPong() {
  const p = pongState;
  const {W, H, PW, PH} = p;
  const b = p.ball, pl = p.player, ai = p.ai;

  // BG
  gc.fillStyle = '#0d0d1a'; gc.fillRect(0,0,W,H);

  // Centre line
  gc.setLineDash([8,8]); gc.strokeStyle = 'rgba(255,255,255,0.1)'; gc.lineWidth = 2;
  gc.beginPath(); gc.moveTo(W/2,0); gc.lineTo(W/2,H); gc.stroke();
  gc.setLineDash([]);

  // Scores on canvas
  gc.font = `bold ${W*0.07}px JetBrains Mono`; gc.textAlign = 'center'; gc.fillStyle = 'rgba(255,255,255,0.15)';
  gc.fillText(pl.score, W*0.25, H*0.18);
  gc.fillText(ai.score, W*0.75, H*0.18);

  // Paddles
  const drawPaddle = (x, y, glow) => {
    gc.shadowColor = glow; gc.shadowBlur = 18;
    gc.fillStyle = glow;
    gc.beginPath(); gc.roundRect(x, y, PW, PH, 4); gc.fill();
    gc.shadowBlur = 0;
  };
  drawPaddle(PW*0.6, pl.y, '#10b981');
  drawPaddle(W - PW*1.6, ai.y, '#7c3aed');

  // Ball
  gc.shadowColor = '#f59e0b'; gc.shadowBlur = 20;
  gc.fillStyle = '#f59e0b';
  gc.beginPath(); gc.arc(b.x, b.y, b.r, 0, Math.PI*2); gc.fill();
  gc.shadowBlur = 0;

  // Labels
  gc.font = `${W*0.022}px Inter`; gc.fillStyle = '#64748b'; gc.textAlign = 'center';
  gc.fillText('YOU', W*0.25, H*0.95);
  gc.fillText('BOT', W*0.75, H*0.95);

  // Game over
  if (p.over) {
    gc.fillStyle = 'rgba(0,0,0,0.7)'; gc.fillRect(0,0,W,H);
    gc.fillStyle = '#fff'; gc.textAlign = 'center';
    gc.font = `bold ${W*0.055}px Inter`; gc.fillText(p.winner, W/2, H/2-12);
    gc.font = `${W*0.03}px Inter`; gc.fillStyle = '#94a3b8';
    gc.fillText('Press ↺ to play again', W/2, H/2+24);
  }
}

// ─── INDIA STATES QUIZ ───────────────────────────────────
// 28 States + 8 Union Territories = 36 total
// lat/lon = approximate centroid
const ALL_STATES = [
  // States
  {name:'Andhra Pradesh',           abbr:'AP',  lat:15.9, lon:79.7},
  {name:'Arunachal Pradesh',        abbr:'AR',  lat:28.2, lon:94.7},
  {name:'Assam',                    abbr:'AS',  lat:26.2, lon:92.9},
  {name:'Bihar',                    abbr:'BR',  lat:25.1, lon:85.3},
  {name:'Chhattisgarh',             abbr:'CG',  lat:21.3, lon:81.9},
  {name:'Goa',                      abbr:'GA',  lat:15.3, lon:74.1},
  {name:'Gujarat',                  abbr:'GJ',  lat:22.3, lon:71.2},
  {name:'Haryana',                  abbr:'HR',  lat:29.1, lon:76.1},
  {name:'Himachal Pradesh',         abbr:'HP',  lat:31.1, lon:77.2},
  {name:'Jharkhand',                abbr:'JH',  lat:23.6, lon:85.3},
  {name:'Karnataka',                abbr:'KA',  lat:15.3, lon:75.7},
  {name:'Kerala',                   abbr:'KL',  lat:10.5, lon:76.3},
  {name:'Madhya Pradesh',           abbr:'MP',  lat:23.5, lon:77.7},
  {name:'Maharashtra',              abbr:'MH',  lat:19.7, lon:75.7},
  {name:'Manipur',                  abbr:'MN',  lat:24.7, lon:93.9},
  {name:'Meghalaya',                abbr:'ML',  lat:25.5, lon:91.4},
  {name:'Mizoram',                  abbr:'MZ',  lat:23.2, lon:92.8},
  {name:'Nagaland',                 abbr:'NL',  lat:26.2, lon:94.6},
  {name:'Odisha',                   abbr:'OD',  lat:20.9, lon:84.7},
  {name:'Punjab',                   abbr:'PB',  lat:31.1, lon:75.3},
  {name:'Rajasthan',                abbr:'RJ',  lat:27.0, lon:74.2},
  {name:'Sikkim',                   abbr:'SK',  lat:27.5, lon:88.5},
  {name:'Tamil Nadu',               abbr:'TN',  lat:11.1, lon:78.7},
  {name:'Telangana',                abbr:'TS',  lat:18.1, lon:79.0},
  {name:'Tripura',                  abbr:'TR',  lat:23.9, lon:91.9},
  {name:'Uttar Pradesh',            abbr:'UP',  lat:26.8, lon:80.9},
  {name:'Uttarakhand',              abbr:'UK',  lat:30.1, lon:79.3},
  {name:'West Bengal',              abbr:'WB',  lat:22.5, lon:87.8},
  // Union Territories
  {name:'Andaman and Nicobar',      abbr:'AN',  lat:11.7, lon:92.7},
  {name:'Chandigarh',               abbr:'CH',  lat:30.7, lon:76.8},
  {name:'Dadra and Nagar Haveli',   abbr:'DN',  lat:20.2, lon:73.0},
  {name:'Delhi',                    abbr:'DL',  lat:28.7, lon:77.1},
  {name:'Jammu and Kashmir',        abbr:'JK',  lat:33.9, lon:76.9},
  {name:'Ladakh',                   abbr:'LA',  lat:34.2, lon:77.6},
  {name:'Lakshadweep',              abbr:'LD',  lat:10.6, lon:72.6},
  {name:'Puducherry',               abbr:'PY',  lat:11.9, lon:79.8},
];

let quizState = {};
let quizTimer = null;

function latLonToXY(lat, lon, W, H) {
  // India bounds: lon 68–97, lat 8–37
  const x = (lon - 68) / 29 * W;
  const y = (37 - lat) / 29 * H;
  return {x, y};
}

function initQuiz() {
  gameTitle.textContent = '🇮🇳 India States Quiz';
  gameHint.textContent  = 'Name all 36 states & UTs — 15 min';

  // India is roughly square in projection, slight portrait
  const W = Math.min(500, Math.floor(window.innerWidth * 0.92));
  const H = Math.round(W * 1.12);
  gameCanvas.width = W; gameCanvas.height = H;

  document.getElementById('quizInputRow').style.display = 'flex';
  document.getElementById('scoreLabel').innerHTML = 'Found: <span id="scoreDisplay">0</span> / 36';
  refreshScoreEl();

  const input = document.getElementById('quizInput');
  input.value = '';
  input.className = 'quiz-input';
  input.disabled = false;
  input.focus();

  const pad = 0.08;
  const states = ALL_STATES.map(s => ({
    ...s,
    px: latLonToXY(s.lat, s.lon, W * (1 - pad*2), H * (1 - pad*2)).x + W * pad,
    py: latLonToXY(s.lat, s.lon, W * (1 - pad*2), H * (1 - pad*2)).y + H * pad,
    guessed: false,
    missed: false,
  }));

  quizState = {
    W, H, states,
    found: 0,
    total: ALL_STATES.length,
    timeLeft: 900,
    over: false,
  };
  scoreEl.textContent = '0';

  if (quizTimer) clearInterval(quizTimer);
  quizTimer = setInterval(() => {
    if (quizState.over) { clearInterval(quizTimer); return; }
    quizState.timeLeft--;
    if (quizState.timeLeft <= 0) quizGiveUp();
    drawQuiz();
  }, 1000);

  input.oninput = () => checkQuizInput();
  drawQuiz();
}

function checkQuizInput() {
  const input = document.getElementById('quizInput');
  const typed = input.value.trim().toLowerCase();
  const match = quizState.states.find(s => !s.guessed && s.name.toLowerCase() === typed);
  if (match) {
    match.guessed = true;
    quizState.found++;
    scoreEl.textContent = quizState.found;
    input.value = '';
    // Flash green
    input.classList.add('flash-green');
    setTimeout(() => input.classList.remove('flash-green'), 400);
    drawQuiz();
    if (quizState.found === quizState.total) { quizState.over = true; clearInterval(quizTimer); drawQuiz(); }
  }
}

function quizGiveUp() {
  quizState.over = true;
  clearInterval(quizTimer);
  quizState.states.forEach(s => { if (!s.guessed) s.missed = true; });
  document.getElementById('quizInput').disabled = true;
  drawQuiz();
}

// Simplified India border (lat, lon pairs, clockwise from NW)
const INDIA_BORDER = [
  [35.0,74.0],[35.5,76.0],[35.2,77.5],[34.8,79.0],[34.5,80.5],
  [33.5,81.0],[32.0,80.5],[30.5,81.0],[29.5,81.5],[28.6,83.0],
  [27.5,84.5],[27.2,87.0],[27.5,88.8],[27.0,89.5],[26.8,91.5],
  [27.5,93.5],[28.2,96.0],[28.0,97.3],[26.5,97.5],[25.0,97.0],
  [24.0,94.5],[23.5,93.5],[23.0,93.2],[22.5,92.5],[22.0,91.5],
  [21.5,89.5],[20.5,87.0],[19.5,85.5],[17.5,82.5],[16.0,81.0],
  [15.0,80.5],[14.0,80.2],[13.2,80.3],[10.5,79.5],[9.0,78.5],
  [8.2,77.5],[8.1,77.2],[8.5,76.8],[9.5,76.5],[10.8,76.0],
  [11.8,75.5],[13.0,74.8],[14.5,74.0],[15.5,73.8],[17.0,73.4],
  [18.5,72.8],[20.0,72.6],[21.5,72.2],[22.5,68.5],[23.5,68.0],
  [25.0,68.5],[27.0,68.5],[28.5,70.5],[29.5,71.5],[30.5,72.5],
  [31.5,73.8],[32.5,74.5],[33.5,74.5],[34.5,74.0],[35.0,74.0],
];

function drawIndiaBorder(W, H) {
  const pad = 0.08;
  const mw = W * (1 - pad * 2), mh = H * (1 - pad * 2);
  const ox = W * pad, oy = H * pad;
  function p(lat, lon) {
    return { x: (lon - 68) / 29 * mw + ox, y: (37 - lat) / 29 * mh + oy };
  }
  gc.beginPath();
  const start = p(INDIA_BORDER[0][0], INDIA_BORDER[0][1]);
  gc.moveTo(start.x, start.y);
  for (let i = 1; i < INDIA_BORDER.length; i++) {
    const pt = p(INDIA_BORDER[i][0], INDIA_BORDER[i][1]);
    gc.lineTo(pt.x, pt.y);
  }
  gc.closePath();
  gc.fillStyle   = 'rgba(99,102,241,0.07)';  gc.fill();
  gc.strokeStyle = 'rgba(139,92,246,0.5)';
  gc.lineWidth   = 1.5;
  gc.setLineDash([]);
  gc.stroke();
}

function drawQuiz() {
  const {W, H, states, found, timeLeft, over} = quizState;
  gc.clearRect(0, 0, W, H);

  // Background
  gc.fillStyle = '#0a0a1a'; gc.fillRect(0, 0, W, H);

  // Ocean texture dots
  gc.fillStyle = 'rgba(255,255,255,0.02)';
  for (let x = 0; x < W; x += 18) for (let y = 0; y < H; y += 18)
    gc.fillRect(x, y, 1, 1);

  // India border
  drawIndiaBorder(W, H);

  // Timer bar
  if (!over) {
    const progress = timeLeft / 600;
    gc.fillStyle = 'rgba(255,255,255,0.05)'; gc.fillRect(0, H - 4, W, 4);
    const barColor = progress > 0.4 ? '#10b981' : progress > 0.2 ? '#f59e0b' : '#ef4444';
    gc.fillStyle = barColor; gc.fillRect(0, H - 4, W * progress, 4);
  }

  // Draw all state dots + labels
  states.forEach(s => {
    const {px, py, guessed, missed, abbr, name} = s;
    if (guessed) {
      // Glowing dot
      gc.shadowColor = '#10b981'; gc.shadowBlur = 12;
      gc.fillStyle = '#10b981';
      gc.beginPath(); gc.arc(px, py, 5, 0, Math.PI * 2); gc.fill();
      gc.shadowBlur = 0;
      // Label
      gc.font = `bold ${Math.max(8, W*0.016)}px JetBrains Mono`;
      gc.fillStyle = '#10b981';
      gc.textAlign = 'center';
      gc.fillText(abbr, px, py - 9);
    } else if (missed) {
      gc.shadowColor = '#ef4444'; gc.shadowBlur = 8;
      gc.fillStyle = '#ef4444';
      gc.beginPath(); gc.arc(px, py, 4, 0, Math.PI * 2); gc.fill();
      gc.shadowBlur = 0;
      gc.font = `bold ${Math.max(7, W*0.014)}px JetBrains Mono`;
      gc.fillStyle = '#ef4444'; gc.textAlign = 'center';
      gc.fillText(abbr, px, py - 8);
    } else {
      gc.fillStyle = 'rgba(148,163,184,0.25)';
      gc.beginPath(); gc.arc(px, py, 3, 0, Math.PI * 2); gc.fill();
    }
  });
  gc.shadowBlur = 0;

  // Timer display
  if (!over) {
    const m = Math.floor(timeLeft / 60), s2 = timeLeft % 60;
    const tStr = `${m}:${String(s2).padStart(2,'0')}`;
    gc.font = `bold ${W*0.03}px JetBrains Mono`;
    gc.textAlign = 'right';
    gc.fillStyle = timeLeft < 60 ? '#ef4444' : 'rgba(255,255,255,0.4)';
    gc.fillText(tStr, W - 12, 26);
  }

  // Game over overlay
  if (over) {
    gc.fillStyle = 'rgba(0,0,0,0.7)'; gc.fillRect(0, 0, W, H);
    gc.textAlign = 'center';
    const total = quizState.total || 36;
    if (found === total) {
      gc.font = `bold ${W*0.07}px Inter`; gc.fillStyle = '#10b981';
      gc.fillText('🎉 All 36!', W/2, H/2 - 16);
    } else {
      gc.font = `bold ${W*0.055}px Inter`; gc.fillStyle = '#fff';
      gc.fillText(`${found} / ${total}`, W/2, H/2 - 16);
      gc.font = `${W*0.035}px Inter`; gc.fillStyle = '#ef4444';
      gc.fillText(`${total - found} missed — shown in red`, W/2, H/2 + 24);
    }
    gc.font = `${W*0.025}px Inter`; gc.fillStyle = '#64748b';
    gc.fillText('Press ↺ to try again', W/2, H/2 + 52);
  }
}

// ─── TOUCH D-PAD ─────────────────────────────────────────
function dpadPress(dir) {
  if (activeGame === 'snake' && snakeState) {
    const d = snakeState.dir;
    if (dir === 'up'    && d.y !== 1)  snakeState.nextDir = {x:0,  y:-1};
    if (dir === 'down'  && d.y !== -1) snakeState.nextDir = {x:0,  y:1};
    if (dir === 'left'  && d.x !== 1)  snakeState.nextDir = {x:-1, y:0};
    if (dir === 'right' && d.x !== -1) snakeState.nextDir = {x:1,  y:0};
  }
  if (activeGame === 'pong' && pongState.keys) {
    if (dir === 'up')   { pongState.keys['w'] = true;  pongState.keys['s'] = false; }
    if (dir === 'down') { pongState.keys['s'] = true;  pongState.keys['w'] = false; }
  }
}
function dpadRelease(dir) {
  if (activeGame === 'pong' && pongState.keys) {
    if (dir === 'up')   pongState.keys['w'] = false;
    if (dir === 'down') pongState.keys['s'] = false;
  }
}

// Keyboard listeners for pong
document.addEventListener('keydown', e => {
  if (pongState.keys) pongState.keys[e.key] = true;
  // Prevent page scroll when playing
  if (['ArrowUp','ArrowDown',' '].includes(e.key) && activeGame) e.preventDefault();
  // Snake direction
  if (activeGame === 'snake' && snakeState) {
    const d = snakeState.dir;
    if ((e.key==='ArrowUp'||e.key==='w'||e.key==='W')    && d.y!==1)  snakeState.nextDir={x:0,y:-1};
    if ((e.key==='ArrowDown'||e.key==='s'||e.key==='S')  && d.y!==-1) snakeState.nextDir={x:0,y:1};
    if ((e.key==='ArrowLeft'||e.key==='a'||e.key==='A')  && d.x!==1)  snakeState.nextDir={x:-1,y:0};
    if ((e.key==='ArrowRight'||e.key==='d'||e.key==='D') && d.x!==-1) snakeState.nextDir={x:1,y:0};
  }
});
document.addEventListener('keyup', e => {
  if (pongState.keys) pongState.keys[e.key] = false;
});

// ===== CARD TILT (subtle) =====
cards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-4px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
