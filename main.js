/* ============================================================
   ULTRA PREMIUM PORTFOLIO — MAIN.JS
   Cinematic Interactions | GSAP-style animations in Vanilla JS
   ============================================================ */

'use strict';

/* ─── UTILITIES ─────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const mapRange = (v, a, b, c, d) => c + ((v - a) / (b - a)) * (d - c);
const isMobile = () => window.innerWidth <= 768;

/* ─── RAF LOOP ──────────────────────────────────────────── */
let rafId;
const rafCbs = new Set();
let isAutoScrolling = false;
let updateSmoothScrollTargets = null;

function startRAF() {
  function loop() {
    rafCbs.forEach(cb => cb());
    rafId = requestAnimationFrame(loop);
  }
  loop();
}

/* ─── PRELOADER ─────────────────────────────────────────── */
function initPreloader() {
  const loader = $('#preloader');
  const barFill = loader.querySelector('.pre-bar-fill');
  const counter = loader.querySelector('.pre-counter');
  const panels = loader.querySelectorAll('.pre-panel');
  const logoSpans = loader.querySelectorAll('.pre-logo .word span');
  const tagline = loader.querySelector('.pre-tagline');

  let progress = 0;
  const target = { v: 0 };

  // Animate logo letters in
  setTimeout(() => {
    logoSpans.forEach((el, i) => {
      setTimeout(() => {
        el.style.transition = `transform 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s, opacity 0.5s ${i * 0.04}s`;
        el.style.transform = 'translateY(0)';
        el.style.opacity = '1';
      }, 200);
    });
    setTimeout(() => {
      tagline.style.transition = 'opacity 0.8s';
      tagline.style.opacity = '1';
    }, 600);
  }, 100);

  // Progress loading simulation
  const interval = setInterval(() => {
    const step = Math.random() * 4 + 1;
    target.v = Math.min(target.v + step, 100);

    barFill.style.width = target.v + '%';
    counter.textContent = Math.floor(target.v) + '%';

    if (target.v >= 100) {
      clearInterval(interval);
      setTimeout(revealPage, 300);
    }
  }, 40);

  function revealPage() {
    // Wipe panels away
    panels.forEach((panel, i) => {
      setTimeout(() => {
        panel.style.transition = `transform 0.7s cubic-bezier(0.76,0,0.24,1) ${i * 0.04}s`;
        panel.style.transform = 'scaleX(0)';
        panel.style.transformOrigin = 'right';
      }, i * 40);
    });

    setTimeout(() => {
      loader.style.transition = 'opacity 0.5s';
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
        document.body.style.cursor = 'none';
        initHero();
        initScrollReveal();
      }, 500);
    }, panels.length * 40 + 500);
  }
}

/* ─── CUSTOM CURSOR ─────────────────────────────────────── */
function initCursor() {
  if (isMobile()) return;

  const dot = $('#cursor-dot');
  const ring = $('#cursor-ring');
  const label = $('#cursor-label');

  let mx = 0, my = 0;
  let rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;

    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
    label.style.left = mx + 'px';
    label.style.top = my + 'px';
  });

  rafCbs.add(() => {
    rx = lerp(rx, mx, 0.1);
    ry = lerp(ry, my, 0.1);
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
  });

  // Hover states
  function setupHoverEl(selector, lbl) {
    $$(selector).forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
        label.textContent = lbl || 'View';
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });
  }

  setupHoverEl('.project-card', 'VIEW');
  setupHoverEl('.btn-primary, .btn-secondary, .nav-cta', 'GO');
  setupHoverEl('.t-btn', 'NEXT');
  setupHoverEl('.social-link', 'FOLLOW');
  setupHoverEl('.contact-email-link', 'EMAIL');
  setupHoverEl('.orbit-planet', 'SKILL');
}

/* ─── SCROLL PROGRESS BAR ───────────────────────────────── */
function initScrollProgress() {
  const bar = $('#scroll-progress');
  window.addEventListener('scroll', () => {
    const st = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (st / max * 100) + '%';
  }, { passive: true });
}

/* ─── SMOOTH SCROLL (Lightweight Lenis-style) ──────────────*/
function initSmoothScroll() {
  if (isMobile()) return; // native scroll on mobile

  let currentY = 0;
  let targetY = 0;
  const ease = 0.085;

  updateSmoothScrollTargets = (val) => {
    targetY = val;
    currentY = val;
  };

  const wrapper = document.querySelector('main') || document.body;

  window.addEventListener('wheel', e => {
    if (isAutoScrolling) return;
    e.preventDefault();
    targetY = clamp(targetY + e.deltaY, 0, document.documentElement.scrollHeight - window.innerHeight);
  }, { passive: false });

  window.addEventListener('keydown', e => {
    if (isAutoScrolling) return;
    const step = 120;
    if (e.key === 'ArrowDown') targetY += step;
    if (e.key === 'ArrowUp') targetY -= step;
    if (e.key === 'PageDown') targetY += window.innerHeight;
    if (e.key === 'PageUp') targetY -= window.innerHeight;
    if (e.key === 'Home') targetY = 0;
    if (e.key === 'End') targetY = document.documentElement.scrollHeight;
    targetY = clamp(targetY, 0, document.documentElement.scrollHeight - window.innerHeight);
  });

  rafCbs.add(() => {
    if (isAutoScrolling) return;
    currentY = lerp(currentY, targetY, ease);
    const rounded = Math.round(currentY * 100) / 100;
    window.scrollTo(0, rounded);

    // Sync scroll bar
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const bar = $('#scroll-progress');
    if (bar) bar.style.width = (rounded / max * 100) + '%';
  });
}

/* ─── NAVBAR ────────────────────────────────────────────── */
function initNavbar() {
  const nav = $('#navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });

  // Smooth anchor links
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ─── HERO ANIMATIONS ────────────────────────────────────── */
function initHero() {
  // Animate heading lines
  const lines = $$('.hero-heading .line-inner');
  lines.forEach((el, i) => {
    setTimeout(() => {
      el.style.transition = `transform 1.1s cubic-bezier(0.16,1,0.3,1), opacity 0.6s`;
      el.style.transform = 'translateY(0)';
      el.style.opacity = '1';
    }, 100 + i * 130);
  });

  // Eyebrow + sub
  setTimeout(() => {
    const ey = $('.hero-eyebrow');
    if (ey) Object.assign(ey.style, { transition: 'opacity 0.8s, transform 0.8s cubic-bezier(0.16,1,0.3,1)', opacity: '1', transform: 'translateY(0)' });
  }, 200);

  setTimeout(() => {
    const sub = $('.hero-sub');
    if (sub) Object.assign(sub.style, { transition: 'opacity 1s, transform 1s cubic-bezier(0.16,1,0.3,1)', opacity: '1', transform: 'translateY(0)' });
  }, 500);

  setTimeout(() => {
    const hint = $('.hero-scroll-hint');
    if (hint) Object.assign(hint.style, { transition: 'opacity 1s', opacity: '1' });
  }, 1200);

  // Init particles
  initHeroParticles();

  // Mouse parallax hero
  initHeroParallax();

  // StarCloud background effect
  initStarCloud();
}

/* ─── HERO PARTICLES ─────────────────────────────────────── */
function initHeroParticles() {
  const canvas = $('#hero-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  function randomParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.5 - 0.1,
      life: Math.random(),
      maxLife: Math.random() * 0.6 + 0.4,
    };
  }

  for (let i = 0; i < 120; i++) particles.push(randomParticle());

  rafCbs.add(() => {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.004;

      if (p.life <= 0) particles[i] = randomParticle();

      const alpha = Math.min(p.life / 0.3, 1) * 0.7;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,122,0,${alpha})`;
      ctx.fill();
    });
  });
}

/* ─── HERO MOUSE PARALLAX ────────────────────────────────── */
function initHeroParallax() {
  if (isMobile()) return;

  const hero = $('#hero');
  const heading = $('.hero-heading');
  const bgImgs = $('.hero-bg-images');

  let tx = 0, ty = 0;
  let cx = 0, cy = 0;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    tx = (e.clientX / rect.width - 0.5) * 30;
    ty = (e.clientY / rect.height - 0.5) * 20;
  });

  rafCbs.add(() => {
    cx = lerp(cx, tx, 0.06);
    cy = lerp(cy, ty, 0.06);

    if (bgImgs) bgImgs.style.transform = `scale(1.1) translate(${cx * 0.3}px, ${cy * 0.3}px)`;
    if (heading) heading.style.transform = `translate(${cx * 0.1}px, ${cy * 0.1}px)`;
  });
}

/* ─── STARCLOUD BACKGROUND EFFECT ───────────────────────── */
function initStarCloud() {
  const canvas = document.getElementById('starcloud-canvas');
  const glowEl = document.querySelector('.hero-starcloud-glow');
  const hero   = document.getElementById('hero');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d');
  const mobile = isMobile();

  /* ── Config ─────────────────────────────────────────────── */
  const PARTICLE_COUNT  = mobile ? 50 : 120;
  const BASE_OPACITY    = mobile ? 0.10 : 0.12; // max alpha cap (8–15% range)
  const FLOAT_SPEED     = 0.15;   // very slow drift
  const MOUSE_STRENGTH  = mobile ? 0 : 6;       // max px nudge from mouse
  const MOUSE_LERP      = 0.03;   // how lazily particles follow mouse
  const COLORS          = ['255,122,0', '255,149,0']; // #ff7a00 / #ff9500

  let W, H;
  function resize() {
    W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); buildParticles(); }, { passive: true });

  /* ── Particle factory ───────────────────────────────────── */
  function makeParticle(randomY) {
    const depth  = 0.3 + Math.random() * 0.7;         // 0.3–1.0 (depth layers)
    const col    = COLORS[Math.floor(Math.random() * COLORS.length)];
    const speed  = FLOAT_SPEED * (0.4 + depth * 0.6);
    return {
      x  : Math.random() * W,
      y  : randomY ? Math.random() * H : H + 10,
      r  : (0.6 + Math.random() * 1.8) * depth,       // 0.2–2.6px
      vx : (Math.random() - 0.5) * speed * 0.4,       // lateral drift
      vy : -(speed + Math.random() * speed * 0.5),    // upward float
      alpha: BASE_OPACITY * (0.5 + depth * 0.5),      // 4–12% opacity
      col,
      depth,
      // mouse-parallax accumulators
      mx : 0, my : 0,
      // twinkle
      twinkleSpeed : 0.005 + Math.random() * 0.015,
      twinkleAngle : Math.random() * Math.PI * 2,
    };
  }

  let particles = [];
  function buildParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(makeParticle(true));
    }
  }
  buildParticles();

  /* ── Mouse tracking ─────────────────────────────────────── */
  let mouseNX = 0, mouseNY = 0; // normalized -0.5 → +0.5
  if (!mobile) {
    hero.addEventListener('mousemove', e => {
      const r  = hero.getBoundingClientRect();
      mouseNX  = (e.clientX - r.left)  / r.width  - 0.5;
      mouseNY  = (e.clientY - r.top)   / r.height - 0.5;
    }, { passive: true });
    hero.addEventListener('mouseleave', () => {
      mouseNX = 0; mouseNY = 0;
    });
  }

  /* ── Scroll-fade state ──────────────────────────────────── */
  let scrollOpacity = 1;

  /* ── RAF draw loop (hooked into global rafCbs) ──────────── */
  rafCbs.add(() => {
    /* Scroll-fade: fade out over the hero height */
    const scrollY   = window.scrollY;
    const heroH     = hero.offsetHeight || window.innerHeight;
    scrollOpacity   = Math.max(0, 1 - (scrollY / (heroH * 0.75)));
    canvas.style.opacity  = scrollOpacity;
    if (glowEl) glowEl.style.opacity = scrollOpacity * 0.85;

    // No need to draw if scrolled past hero
    if (scrollOpacity <= 0) return;

    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      /* Float movement */
      p.x += p.vx;
      p.y += p.vy;

      /* Twinkle: subtle alpha pulse */
      p.twinkleAngle += p.twinkleSpeed;
      const twinkle = 0.75 + 0.25 * Math.sin(p.twinkleAngle);

      /* Mouse micro-parallax */
      if (!mobile) {
        const targetMX = mouseNX * MOUSE_STRENGTH * p.depth;
        const targetMY = mouseNY * MOUSE_STRENGTH * p.depth;
        p.mx = lerp(p.mx, targetMX, MOUSE_LERP);
        p.my = lerp(p.my, targetMY, MOUSE_LERP);
      }

      /* Wrap around edges */
      if (p.y < -p.r * 2)  { Object.assign(p, makeParticle(false)); }
      if (p.x < -p.r * 20) { p.x = W + p.r * 5; }
      if (p.x > W + p.r * 20) { p.x = -p.r * 5; }

      /* Draw */
      const drawX = p.x + p.mx;
      const drawY = p.y + p.my;
      const alpha = p.alpha * twinkle * scrollOpacity;

      // Larger particles get a soft glow halo
      if (p.r > 1.2) {
        const grad = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, p.r * 4);
        grad.addColorStop(0,   `rgba(${p.col},${alpha})`);
        grad.addColorStop(0.4, `rgba(${p.col},${alpha * 0.3})`);
        grad.addColorStop(1,   `rgba(${p.col},0)`);
        ctx.beginPath();
        ctx.arc(drawX, drawY, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Core dot
      ctx.beginPath();
      ctx.arc(drawX, drawY, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.col},${Math.min(alpha * 1.6, BASE_OPACITY * 1.8)})`;
      ctx.fill();
    });
  });
}

/* ─── SCROLL REVEAL ──────────────────────────────────────── */
function initScrollReveal() {
  const obsOpts = { threshold: 0.12, rootMargin: '0px 0px -5% 0px' };

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, obsOpts);

  if (window.innerWidth > 768) {
    $$('.fade-up, .fade-in, .reveal-text, .about-circle-wrap, .project-card').forEach(el => obs.observe(el));
  } else {
    $$('.fade-up, .fade-in, .reveal-text, .about-circle-wrap, .project-card').forEach(el => {
      el.classList.add('revealed');
    });
  }

  // Staggered children
  $$('[data-stagger]').forEach(parent => {
    const children = parent.children;
    Array.from(children).forEach((child, i) => {
      child.style.transitionDelay = (i * 0.08) + 's';
    });
  });

  // Stat counters
  const statObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-number[data-count]').forEach(el => {
          animateCounter(el);
        });
        statObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsEl = $('.about-stats');
  if (statsEl) statObs.observe(statsEl);

  // Skill bars
  const skillObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
          setTimeout(() => {
            bar.style.width = bar.dataset.pct + '%';
          }, 200);
        });
        skillObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const skillsEl = $('.skills-list');
  if (skillsEl) skillObs.observe(skillsEl);

  // Project card reveal
  const cardObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        cardObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  $$('.project-card').forEach(c => cardObs.observe(c));
}

/* ─── COUNTER ANIMATION ──────────────────────────────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const dur = 1800;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = clamp(elapsed / dur, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    const val = Math.round(eased * target);
    el.innerHTML = `${prefix}${val}<span class="orange">${suffix}</span>`;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/* ─── HORIZONTAL SCROLL GALLERY ─────────────────────────── */
function initHorizontalScroll() {
  const wrapper = $('.h-scroll-wrapper');
  const track = $('.h-scroll-track');
  if (!wrapper || !track) return;

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let velocity = 0;
  let lastX = 0;
  let momentum = false;

  // Drag scroll
  wrapper.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - wrapper.offsetLeft;
    scrollLeft = wrapper.scrollLeft;
    lastX = e.pageX;
    velocity = 0;
    wrapper.style.cursor = 'grabbing';
  });

  wrapper.addEventListener('mouseup', () => {
    isDown = false;
    wrapper.style.cursor = 'none';
    addMomentum();
  });

  wrapper.addEventListener('mouseleave', () => {
    if (isDown) {
      isDown = false;
      addMomentum();
    }
  });

  wrapper.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - wrapper.offsetLeft;
    const walk = (x - startX) * 1.5;
    velocity = e.pageX - lastX;
    lastX = e.pageX;
    wrapper.scrollLeft = scrollLeft - walk;
  });

  function addMomentum() {
    if (Math.abs(velocity) < 1) return;
    let v = velocity * 8;

    function step() {
      wrapper.scrollLeft -= v;
      v *= 0.88;
      if (Math.abs(v) > 0.5) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // Scroll parallax effect on cards
  if (!isMobile()) {
    rafCbs.add(() => {
      const containerRect = wrapper.getBoundingClientRect();
      $$('.project-card', wrapper).forEach(card => {
        const rect = card.getBoundingClientRect();
        const rel = (rect.left - containerRect.left) / containerRect.width;
        const tilt = mapRange(rel, 0, 1, -8, 8);
        card.style.transform = card.matches(':hover') ? '' : `perspective(1200px) rotateY(${tilt * 0.3}deg)`;
      });
    });
  }

  // Touch scroll
  wrapper.addEventListener('touchstart', e => {
    startX = e.touches[0].pageX;
    scrollLeft = wrapper.scrollLeft;
  }, { passive: true });

  wrapper.addEventListener('touchmove', e => {
    const x = e.touches[0].pageX;
    wrapper.scrollLeft = scrollLeft - (x - startX);
  }, { passive: true });
}

/* ─── 3D CARD TILT ───────────────────────────────────────── */
function initCardTilt() {
  $$('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rx = (e.clientY - cy) / (rect.height / 2) * -10;
      const ry = (e.clientX - cx) / (rect.width / 2) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-12px) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ─── PROJECT OVERLAY ────────────────────────────────────── */
const projects = [
  {
    title: 'SOCIAL MEDIA POSTER DESIGN',
    tags: ['Social Media', 'Ad Creative', 'Marketing Design'],
    year: '2024',
    client: 'Multiple Clients',
    role: 'Graphic Designer',
    imgClass: 'project-card-img--social',
    desc: 'Scroll-stopping social media poster designs crafted for Instagram, Facebook, and digital ad platforms. Bold visuals, cinematic color-grading and typography systems built to maximize engagement and brand recall.',
  },
  {
    title: 'YOUTUBE THUMBNAIL DESIGN',
    tags: ['YouTube', 'Thumbnail', 'CTR Design'],
    year: '2024',
    client: 'Content Creators',
    role: 'Thumbnail Designer',
    imgClass: 'project-card-img--yt',
    desc: 'High-CTR YouTube thumbnail designs that blend striking title typography, color-graded visuals, and focused composition to dramatically boost click-through rates and channel growth.',
  },
  {
    title: 'PACKAGING DESIGN',
    tags: ['Packaging', 'Branding', 'Product Design'],
    year: '2024',
    client: 'Product Brands',
    role: 'Packaging Designer',
    imgClass: 'project-card-img--packaging',
    desc: 'Custom premium product labels, structural box wraps, and packaging systems that command shelf presence. Dark luxury aesthetics with cinematic orange accents for an unforgettable unboxing experience.',
  },
  {
    title: 'LINKEDIN COVER DESIGN',
    tags: ['LinkedIn', 'Personal Branding', 'Banner Design'],
    year: '2024',
    client: 'Professionals & Brands',
    role: 'Brand Designer',
    imgClass: 'project-card-img--linkedin',
    desc: 'Professional LinkedIn profile banners and company page covers designed to communicate authority, expertise, and brand identity at a glance. Clean, premium layouts that convert profile views to connections.',
  },
  {
    title: 'FLYER DESIGN',
    tags: ['Print Design', 'Promotional', 'Marketing'],
    year: '2024',
    client: 'Events & Businesses',
    role: 'Graphic Designer',
    imgClass: 'project-card-img--flyer',
    desc: 'Impactful print and digital flyer designs for events, promotions, and business announcements. Dramatic orange lighting, bold hierarchy, and premium composition that demands attention.',
  },
  {
    title: 'UI/UX DESIGN',
    tags: ['UI Design', 'UX Experience', 'Web Interface'],
    year: '2024',
    client: 'Tech Startups',
    role: 'UI/UX Designer',
    imgClass: 'project-card-img--uiux',
    desc: 'User-centered dark-themed responsive web and app interfaces that prioritize sleek layouts, intuitive navigation, and premium visual language. Smooth micro-interactions and futuristic design systems.',
  },
];

function initProjectOverlay() {
  const overlay = $('#project-overlay');
  const lens = overlay.querySelector('.overlay-lens');
  const content = overlay.querySelector('.overlay-content');
  const closeBtn = overlay.querySelector('.overlay-close-btn');

  $$('.project-card').forEach((card, i) => {
    card.addEventListener('click', e => {
      const titleText = card.querySelector('.project-card-title')?.textContent.trim();

      if (titleText === 'Social Media Poster Design') {
        triggerPageTransition('social-media-posters.html');
        return;
      }
      if (titleText === 'YouTube Thumbnail Design') {
        triggerPageTransition('youtube-thumbnails.html');
        return;
      }

      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // Position lens at card center
      Object.assign(lens.style, {
        width: '10px', height: '10px',
        left: cx + 'px', top: cy + 'px',
        transform: 'translate(-50%, -50%) scale(0)',
        transition: 'none',
      });

      const cardVisual = card.querySelector('.card-visual-inner');
      const visualHTML = cardVisual ? cardVisual.outerHTML : '';

      setTimeout(() => {
        lens.style.transition = 'transform 0.9s cubic-bezier(0.16,1,0.3,1), border-radius 0.9s cubic-bezier(0.16,1,0.3,1)';
        lens.style.transform = 'translate(-50%, -50%) scale(30)';
        lens.style.borderRadius = '0';
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        populateOverlay(projects[i % projects.length], visualHTML);
      }, 10);
    });
  });

  function populateOverlay(project, visualHTML) {
    content.innerHTML = `
      <button class="overlay-close-btn" id="ov-close-btn" aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <div class="overlay-hero-img ${project.imgClass || ''}">
        ${visualHTML}
      </div>
      <div style="max-width:1200px;margin:0 auto;">
        <p class="eyebrow" style="margin-bottom:20px">${project.tags[0]}</p>
        <h2 class="overlay-title">${project.title}</h2>
        <div class="overlay-meta">
          <div class="overlay-meta-item"><label>Year</label><span>${project.year}</span></div>
          <div class="overlay-meta-item"><label>Client</label><span>${project.client}</span></div>
          <div class="overlay-meta-item"><label>Role</label><span>${project.role}</span></div>
        </div>
        <p class="overlay-desc">${project.desc}</p>
        <div class="project-card-tags" style="margin-top:32px">
          ${project.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
        </div>
      </div>
    `;

    $('#ov-close-btn').addEventListener('click', closeOverlay);
  }

  closeBtn && closeBtn.addEventListener('click', closeOverlay);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeOverlay();
  });

  function closeOverlay() {
    overlay.classList.remove('open');
    lens.style.transition = 'transform 0.7s cubic-bezier(0.76,0,0.24,1), border-radius 0.5s 0.2s';
    lens.style.transform = 'translate(-50%, -50%) scale(0)';
    lens.style.borderRadius = '50%';
    document.body.style.overflow = '';
  }
}

/* ─── ORBIT SKILL SYSTEM ─────────────────────────────────── */
function initOrbit() {
  const system = $('.orbit-system');
  if (!system) return;

  const planets = $$('.orbit-planet', system);
  const rings = [
    { r: 100, speed: 0.012 },
    { r: 165, speed: 0.008 },
    { r: 230, speed: 0.005 },
  ];

  const planetData = planets.map((el, i) => {
    const ring = rings[i % rings.length];
    return {
      el,
      r: ring.r,
      angle: (i / planets.length) * Math.PI * 2,
      speed: ring.speed * (i % 2 === 0 ? 1 : -1),
    };
  });

  rafCbs.add(() => {
    planetData.forEach(p => {
      p.angle += p.speed;
      const size = system.offsetWidth;
      const cx = size / 2;
      const cy = size / 2;
      const scale = size / 500;
      const x = cx + Math.cos(p.angle) * p.r * scale - 26;
      const y = cy + Math.sin(p.angle) * p.r * scale - 26;
      p.el.style.left = x + 'px';
      p.el.style.top = y + 'px';
      p.el.style.position = 'absolute';
    });
  });
}

/* ─── TESTIMONIALS CAROUSEL ──────────────────────────────── */
function initTestimonials() {
  const cards = $$('.testimonial-card');
  const dots = $$('.t-dot');
  const prevBtn = $('#t-prev');
  const nextBtn = $('#t-next');
  if (!cards.length) return;

  let current = 0;
  let autoTimer;

  function go(idx) {
    const prev = current;
    current = (idx + cards.length) % cards.length;

    cards[prev].classList.remove('active');
    cards[prev].classList.add('prev');

    setTimeout(() => cards[prev].classList.remove('prev'), 900);

    cards[current].classList.add('active');

    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => go(current + 1), 5000);
  }

  cards[0].classList.add('active');
  dots[0] && dots[0].classList.add('active');
  startAuto();

  prevBtn && prevBtn.addEventListener('click', () => { go(current - 1); startAuto(); });
  nextBtn && nextBtn.addEventListener('click', () => { go(current + 1); startAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { go(i); startAuto(); }));
}

/* ─── MAGNETIC BUTTONS ───────────────────────────────────── */
function initMagnetic() {
  if (isMobile()) return;

  $$('.btn-primary, .btn-secondary, .nav-cta, .social-link').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.35;
      const dy = (e.clientY - cy) * 0.35;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

/* ─── KINETIC TEXT SCRAMBLE ──────────────────────────────── */
function initTextScramble() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';

  function scramble(el, finalText, duration = 800) {
    const steps = 20;
    const delay = duration / steps;
    let step = 0;

    const interval = setInterval(() => {
      el.textContent = finalText.split('').map((ch, i) => {
        if (ch === ' ') return ' ';
        if (i < step) return finalText[i];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');

      step++;
      if (step > finalText.length) clearInterval(interval);
    }, delay);
  }

  $$('[data-scramble]').forEach(el => {
    const orig = el.dataset.scramble;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        scramble(el, orig);
        obs.unobserve(el);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
  });
}

/* ─── SPLIT TEXT HELPER ──────────────────────────────────── */
function splitTextIntoLines() {
  $$('.hero-heading').forEach(el => {
    // Already structured in HTML
  });
}

/* ─── SECTION PARALLAX ───────────────────────────────────── */
function initParallax() {
  if (isMobile()) return;

  const parallaxEls = $$('[data-parallax]');

  rafCbs.add(() => {
    const scrollY = window.scrollY;
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const rel = (window.innerHeight / 2 - center);
      el.style.transform = `translateY(${rel * speed}px)`;
    });
  });
}

/* ─── SERVICE CARDS STAGGER ──────────────────────────────── */
function initServiceCards() {
  if (!isMobile()) return;

  const wrappers = $$('.services-grid .service-card-wrapper');
  const cards = $$('.services-grid .service-card');
  if (wrappers.length === 0) return;

  // Ensure they are fully visible initially (bypass any scroll reveal delays)
  cards.forEach(card => {
    card.style.opacity = '1';
    card.style.transform = 'none';
  });

  rafCbs.add(() => {
    const vh = window.innerHeight;
    
    wrappers.forEach((wrapper, i) => {
      const card = cards[i];
      if (!card) return;
      
      const rect = wrapper.getBoundingClientRect();
      const stickyTop = 80; // Matches CSS top: 80px for all cards
      
      // Compute progress once the wrapper passes the sticky zone
      const y = rect.top - stickyTop;
      
      if (y < 0) {
        // Card is sticky and is being overlapped by subsequent cards
        const range = rect.height || (vh * 0.5);
        const factor = clamp(Math.abs(y) / range, 0, 1);
        
        // Scale down, tilt back, shift upwards, fade and blur
        const scale = 1 - factor * 0.08;
        const rotateX = -factor * 12;
        const translateY = -factor * 20;
        const opacity = 1 - factor * 0.45;
        const blur = factor * 3;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) scale(${scale}) translateY(${translateY}px)`;
        card.style.opacity = `${opacity}`;
        card.style.filter = blur > 0.15 ? `blur(${blur}px)` : 'none';
      } else {
        // Normal state before sticking
        card.style.transform = 'none';
        card.style.opacity = '1';
        card.style.filter = 'none';
      }
    });
  });
}

/* ─── AMBIENT BACKGROUND ─────────────────────────────────── */
function initAmbientBg() {
  // Inject ambient orbs into sections
  const sections = ['#about', '#services', '#skills', '#testimonials'];
  sections.forEach(sel => {
    const sec = $(sel);
    if (!sec) return;
    sec.style.position = 'relative';
    const orb = document.createElement('div');
    orb.className = 'ambient-orb';
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const top = 20 + Math.random() * 60;
    Object.assign(orb.style, {
      width: '400px',
      height: '400px',
      background: 'radial-gradient(circle, rgba(255,122,0,0.2) 0%, transparent 70%)',
      [side]: '-150px',
      top: top + '%',
      transform: 'translateY(-50%)',
    });
    sec.appendChild(orb);
  });
}

/* ─── PREMIUM ORANGE LUXURY CURSOR LIGHTING ──────────────── */
function initHologramBackground() {
  const canvas = $('#hologram-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* GPU promotion */
  canvas.style.willChange     = 'transform';
  canvas.style.transform      = 'translateZ(0)';
  canvas.style.backfaceVisibility = 'hidden';

  const mobile = isMobile();

  /* ── Palette ─────────────────────────────────────────────── */
  const C_PRIMARY   = '255,122,0';   // #ff7a00
  const C_SECONDARY = '255,149,0';   // #ff9500
  const C_HIGHLIGHT = '255,179,71';  // #ffb347

  /* ── Canvas sizing ───────────────────────────────────────── */
  let W = window.innerWidth, H = window.innerHeight;

  /* ── Slow ambient blobs (always-on warmth) ───────────────── */
  const ambientBlobs = [
    { nx: 0.15, ny: 0.3,  r: 520, speed: 0.00028, angle: 0,           opacity: mobile ? 0.018 : 0.030 },
    { nx: 0.85, ny: 0.72, r: 600, speed: 0.00018, angle: Math.PI,     opacity: mobile ? 0.014 : 0.022 },
    { nx: 0.5,  ny: 0.12, r: 420, speed: 0.00022, angle: Math.PI / 2, opacity: mobile ? 0.012 : 0.018 },
  ];
  /* Seed initial positions */
  ambientBlobs.forEach(b => { b.x = W * b.nx; b.y = H * b.ny; b.tx = b.x; b.ty = b.y; });

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    ambientBlobs.forEach(b => { b.tx = W * b.nx; b.ty = H * b.ny; });
  }
  resize(); // set canvas dimensions

  /* ── Mouse / spotlight state ─────────────────────────────── */
  let mouseX = W / 2, mouseY = H / 2;
  let targetX = W / 2, targetY = H / 2;
  let lastMoveTime = performance.now();
  let cursorActive = true;

  /* Light streak trail — last N positions */
  const TRAIL_LEN  = mobile ? 0 : 14;
  const trailPos   = [];

  /* ── Inactivity fade ─────────────────────────────────────── */
  const INACTIVE_DELAY = 3000; // ms before fade starts
  let   spotOpacity    = 1.0;  // current rendered opacity (lerped)
  let   spotTarget     = 1.0;  // 0 when idle, 1 when active

  window.addEventListener('mousemove', e => {
    targetX = e.clientX;
    targetY = e.clientY;
    lastMoveTime  = performance.now();
    cursorActive  = true;
    spotTarget    = 1.0;
  }, { passive: true });

  /* ── Section intensity map ───────────────────────────────── */
  // Hero gets a stronger glow; other sections are softer
  function getSectionMultiplier() {
    const el = document.elementFromPoint(mouseX, mouseY);
    if (!el) return 0.7;
    const section = el.closest('#hero')         ? 1.0  // strongest
                  : el.closest('.project-card') ? 0.85  // cards boost
                  : el.closest('.btn-primary, .btn-secondary, .nav-cta') ? 0.9
                  : el.closest('#about, #services, #skills, #testimonials, #contact') ? 0.55
                  : 0.7;
    return section;
  }

  /* ── Hover bloom on cards & buttons (DOM, not canvas) ───── */
  if (!mobile) {
    function addBloom(el, size, strength) {
      el.style.transition = 'box-shadow 0.4s cubic-bezier(0.16,1,0.3,1)';
      el.style.boxShadow  = `0 0 ${size}px ${Math.round(size/3)}px rgba(${C_PRIMARY},${strength}), 0 0 ${size*2}px rgba(${C_PRIMARY},${strength * 0.3})`;
    }
    function removeBloom(el) {
      el.style.boxShadow = '';
    }

    document.addEventListener('mouseover', e => {
      const btn  = e.target.closest('.btn-primary, .btn-secondary, .nav-cta');
      const card = e.target.closest('.project-card, .service-card');
      if (btn)  addBloom(btn,  28, 0.35);
      if (card) addBloom(card, 45, 0.18);
    });
    document.addEventListener('mouseout', e => {
      const btn  = e.target.closest('.btn-primary, .btn-secondary, .nav-cta');
      const card = e.target.closest('.project-card, .service-card');
      if (btn)  removeBloom(btn);
      if (card) removeBloom(card);
    });
  }

  window.addEventListener('resize', resize, { passive: true });


  /* ── RAF draw loop ───────────────────────────────────────── */
  rafCbs.add(() => {
    const now = performance.now();

    /* Inactivity check */
    if (now - lastMoveTime > INACTIVE_DELAY) {
      cursorActive = false;
      spotTarget   = 0.0;
    }
    spotOpacity = lerp(spotOpacity, spotTarget, 0.025); // very smooth fade

    /* Smooth cursor lerp */
    const lerpSpeed = mobile ? 0.08 : 0.055;
    mouseX = lerp(mouseX, targetX, lerpSpeed);
    mouseY = lerp(mouseY, targetY, lerpSpeed);

    /* Trail append */
    if (!mobile) {
      trailPos.unshift({ x: mouseX, y: mouseY });
      if (trailPos.length > TRAIL_LEN) trailPos.pop();
    }

    /* Section intensity */
    const sectionMult = getSectionMultiplier();
    const baseOpacity = (mobile ? 0.55 : 1.0) * sectionMult;

    /* ── Clear canvas with pure black ── */
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#070707';
    ctx.fillRect(0, 0, W, H);

    /* ── 1. Slow ambient background warmth ── */
    ambientBlobs.forEach(b => {
      b.angle += b.speed;
      b.x = b.tx + Math.cos(b.angle) * 90;
      b.y = b.ty + Math.sin(b.angle) * 55;

      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0,   `rgba(${C_PRIMARY},${b.opacity})`);
      g.addColorStop(0.5, `rgba(${C_PRIMARY},${b.opacity * 0.35})`);
      g.addColorStop(1,   `rgba(${C_PRIMARY},0)`);
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });

    /* ── 2. Cursor spotlight (only when active or fading) ── */
    if (spotOpacity > 0.005) {
      const so = spotOpacity * baseOpacity;

      /* Wide corona — warm ambient spill */
      const r1 = mobile ? 260 : 460;
      const g1 = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, r1);
      g1.addColorStop(0,    `rgba(${C_PRIMARY},${0.10 * so})`);
      g1.addColorStop(0.35, `rgba(${C_PRIMARY},${0.048 * so})`);
      g1.addColorStop(0.65, `rgba(${C_SECONDARY},${0.018 * so})`);
      g1.addColorStop(1,    `rgba(${C_PRIMARY},0)`);
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, r1, 0, Math.PI * 2);
      ctx.fillStyle = g1;
      ctx.fill();

      /* Mid glow — warm focused light */
      const r2 = mobile ? 130 : 210;
      const g2 = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, r2);
      g2.addColorStop(0,   `rgba(${C_SECONDARY},${0.18 * so})`);
      g2.addColorStop(0.4, `rgba(${C_PRIMARY},${0.09 * so})`);
      g2.addColorStop(1,   `rgba(${C_PRIMARY},0)`);
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, r2, 0, Math.PI * 2);
      ctx.fillStyle = g2;
      ctx.fill();

      /* Hot core — bright highlight centre */
      const r3 = mobile ? 55 : 80;
      const g3 = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, r3);
      g3.addColorStop(0,    `rgba(${C_HIGHLIGHT},${0.22 * so})`);
      g3.addColorStop(0.45, `rgba(${C_SECONDARY},${0.10 * so})`);
      g3.addColorStop(1,    `rgba(${C_PRIMARY},0)`);
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, r3, 0, Math.PI * 2);
      ctx.fillStyle = g3;
      ctx.fill();

      /* ── 3. Motion light-streak trail ── */
      if (!mobile && trailPos.length > 1) {
        trailPos.forEach((pt, i) => {
          const t     = 1 - i / TRAIL_LEN;  // 1 → 0 (newest → oldest)
          const alpha = t * t * 0.045 * so; // quadratic falloff
          const rT    = 35 * t;
          if (alpha < 0.002) return;
          const gT = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, rT);
          gT.addColorStop(0, `rgba(${C_HIGHLIGHT},${alpha})`);
          gT.addColorStop(1, `rgba(${C_PRIMARY},0)`);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, rT, 0, Math.PI * 2);
          ctx.fillStyle = gT;
          ctx.fill();
        });
      }
    }

    /* ── 4. Resting ambient glow when idle ── */
    if (spotOpacity < 0.98) {
      const idleAlpha = (1 - spotOpacity) * 0.030;
      const rI = 500;
      const gI = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, rI);
      gI.addColorStop(0,   `rgba(${C_PRIMARY},${idleAlpha})`);
      gI.addColorStop(0.6, `rgba(${C_PRIMARY},${idleAlpha * 0.3})`);
      gI.addColorStop(1,   `rgba(${C_PRIMARY},0)`);
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, rI, 0, Math.PI * 2);
      ctx.fillStyle = gI;
      ctx.fill();
    }
  });
}

function triggerPageTransition(url) {
  const overlay = $('#page-transition');
  if (overlay) {
    overlay.classList.add('active');
    const sweep = overlay.querySelector('.transition-sweep');
    if (sweep) {
      sweep.style.transition = 'none';
      sweep.style.left = '-150%';
      sweep.offsetHeight; // force reflow
      sweep.style.transition = 'left 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      sweep.style.left = '150%';
    }
    setTimeout(() => {
      window.location.href = url;
    }, 600);
  } else {
    window.location.href = url;
  }
}

function initPageTransitions() {
  const overlay = $('#page-transition');
  if (!overlay) return;

  // Fade out transition overlay on page load
  requestAnimationFrame(() => {
    overlay.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    overlay.classList.remove('active');
  });

  // Intercept all internal page links
  const links = $$('a[href$=".html"], a[href^="index.html"]');
  links.forEach(link => {
    // Skip if it's just a hash navigation on the same page
    const href = link.getAttribute('href');
    if (href.startsWith('#')) return;

    link.addEventListener('click', e => {
      const targetUrl = link.href;
      // Navigate only if it's a valid link within the same origin
      if (targetUrl && (targetUrl.includes(window.location.hostname) || targetUrl.startsWith('/') || !targetUrl.includes('://'))) {
        e.preventDefault();
        triggerPageTransition(href);
      }
    });
  });
}

/* ─── ABOUT SECTION PARTICLES ────────────────────────────── */
function initAboutParticles() {
  const canvas = $('.about-particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const wrap = canvas.closest('.about-visual-col');
  if (!wrap) return;

  let W, H, pts = [];

  function resize() {
    const r = wrap.getBoundingClientRect();
    W = canvas.width = r.width + 120;
    H = canvas.height = r.height + 120;
  }

  resize();
  window.addEventListener('resize', () => { resize(); pts = []; for (let i = 0; i < 40; i++) pts.push(mkPt()); });

  function mkPt() {
    const angle = Math.random() * Math.PI * 2;
    const dist = 160 + Math.random() * 120;
    const cx = W / 2, cy = H / 2;
    return {
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      life: Math.random(),
      speed: Math.random() * 0.003 + 0.001,
    };
  }

  for (let i = 0; i < 40; i++) pts.push(mkPt());

  // Only run when about section is visible
  const aboutSec = $('#about');
  let active = false;
  if (aboutSec) {
    const io = new IntersectionObserver(e => { active = e[0].isIntersecting; }, { threshold: 0.1 });
    io.observe(aboutSec);
  }

  rafCbs.add(() => {
    if (!active) return;
    ctx.clearRect(0, 0, W, H);
    pts.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.speed;
      if (p.life <= 0) pts[i] = mkPt();

      const alpha = Math.min(p.life / 0.4, 1) * 0.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,122,0,${alpha})`;
      ctx.fill();
    });
  });
}

/* ─── SMOOTH SCROLL TO HELPER ───────────────────────────── */
function smoothScrollTo(targetEl, duration = 1000) {
  if (!targetEl) return;
  
  const start = window.scrollY;
  const target = targetEl.getBoundingClientRect().top + start;
  const distance = target - start;
  let startTime = null;

  // Show the glow trail line
  let glowTrail = document.getElementById('scroll-glow-trail');
  if (!glowTrail) {
    glowTrail = document.createElement('div');
    glowTrail.id = 'scroll-glow-trail';
    document.body.appendChild(glowTrail);
  }
  
  glowTrail.style.display = 'block';
  glowTrail.offsetHeight; // Force reflow
  glowTrail.style.opacity = '1';

  isAutoScrolling = true;

  // Quart easeInOut function
  function easeInOutQuart(t) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
  }

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const percentage = Math.min(progress / duration, 1);
    const eased = easeInOutQuart(percentage);
    
    const nextScrollY = start + distance * eased;
    window.scrollTo(0, nextScrollY);

    if (progress < duration) {
      requestAnimationFrame(step);
    } else {
      window.scrollTo(0, target);
      // Fade out glow trail
      glowTrail.style.opacity = '0';
      setTimeout(() => {
        glowTrail.style.display = 'none';
      }, 300);

      // Synced targets for lightweight Lenis
      if (typeof updateSmoothScrollTargets === 'function') {
        updateSmoothScrollTargets(target);
      }
      isAutoScrolling = false;
    }
  }

  requestAnimationFrame(step);
}

/* ─── HIRE ME MODAL & WORK TOGETHER SCROLL ────────────────── */
function initHireMeModalAndScroll() {
  // 1. Work Together button custom scroll
  const wtBtn = $('.btn-work-together');
  if (wtBtn) {
    wtBtn.addEventListener('click', e => {
      const contactSection = $('#contact');
      if (contactSection) {
        e.preventDefault();
        smoothScrollTo(contactSection, 1000);
      }
    });
  }

  // 2. Modal open/close controls
  const modal = $('#hire-modal');
  const openBtns = $$('.btn-hire-me');
  const closeBtn = $('#close-modal-btn');
  const form = $('#hire-form');

  if (!modal) return;

  function openModal() {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // prevent bg scrolling
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // restore bg scrolling
  }

  openBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Close when clicking overlay backdrop
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on ESC key
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // 3. Form WhatsApp submission
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const name = $('#hire-name').value;
      const phone = $('#hire-phone').value;
      const email = $('#hire-email').value || 'Not provided';
      const designType = $('#hire-design-type').value;
      const details = $('#hire-details').value;

      // Format WhatsApp message text
      const messageText = `Hello Suganesh,

Name: ${name}

Phone: ${phone}

Email: ${email}

Design Type: ${designType}

Project Details:
${details}

I would like to discuss this project.`;

      // Encode message text for URL
      const encodedText = encodeURIComponent(messageText);
      const whatsappUrl = `https://wa.me/917305290305?text=${encodedText}`;

      // Open WhatsApp directly
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      closeModal();
    });
  }
}



/* ─── INIT ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initPageTransitions();
  startRAF();
  initCursor();
  initScrollProgress();
  initNavbar();

  initPreloader();

  // These run after preloader
  // (initHero, initScrollReveal are called from preloader)
  initHologramBackground();
  initHorizontalScroll();
  initCardTilt();
  initProjectOverlay();
  initOrbit();
  initTestimonials();
  initMagnetic();
  initTextScramble();
  initParallax();
  initServiceCards();
  initAmbientBg();
  initAboutParticles();
  initHireMeModalAndScroll();
});
