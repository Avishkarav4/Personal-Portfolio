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
