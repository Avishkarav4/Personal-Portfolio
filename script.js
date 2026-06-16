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
const scoreEl    = document.getElementById('scoreDisplay');
const gameTitle  = document.getElementById('gameTitle');
const gameHint   = document.getElementById('gameHint');

let activeGame = null;
let gameLoop   = null;

function openGame(type) {
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  activeGame = type;
  if (type === 'snake') initSnake();
  else initPong();
}

function closeGame(e) {
  if (e && e.target !== overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  if (gameLoop) { clearInterval(gameLoop); cancelAnimationFrame(gameLoop); gameLoop = null; }
  activeGame = null;
}

function restartGame() {
  if (gameLoop) { clearInterval(gameLoop); cancelAnimationFrame(gameLoop); gameLoop = null; }
  if (activeGame === 'snake') initSnake();
  else if (activeGame === 'pong') initPong();
}

// ─── SNAKE ───────────────────────────────────────────────
const CELL = 20;
let snakeState = {};

function initSnake() {
  gameTitle.textContent = '🐍 Snake';
  gameHint.textContent  = 'Arrow keys / WASD to move';
  const size = Math.min(500, Math.floor((window.innerWidth * 0.85) / CELL) * CELL);
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
  gameHint.textContent  = 'W/S — move paddle  |  vs AI';
  const W = Math.min(640, Math.floor(window.innerWidth * 0.88));
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
  if (b.x < 0) { p.winner = '🤖 AI Wins!'; p.over = true; }
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
  gc.fillText('AI', W*0.75, H*0.95);

  // Game over
  if (p.over) {
    gc.fillStyle = 'rgba(0,0,0,0.7)'; gc.fillRect(0,0,W,H);
    gc.fillStyle = '#fff'; gc.textAlign = 'center';
    gc.font = `bold ${W*0.055}px Inter`; gc.fillText(p.winner, W/2, H/2-12);
    gc.font = `${W*0.03}px Inter`; gc.fillStyle = '#94a3b8';
    gc.fillText('Press ↺ to play again', W/2, H/2+24);
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
