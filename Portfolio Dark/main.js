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

function startRAF() {
  function loop() {
    rafCbs.forEach(cb => cb());
    rafId = requestAnimationFrame(loop);
  }
  loop();
}

/* ─── PRELOADER ─────────────────────────────────────────── */
function initPreloader() {
  const loader      = $('#preloader');
  const barFill     = loader.querySelector('.pre-bar-fill');
  const counter     = loader.querySelector('.pre-counter');
  const panels      = loader.querySelectorAll('.pre-panel');
  const logoSpans   = loader.querySelectorAll('.pre-logo .word span');
  const tagline     = loader.querySelector('.pre-tagline');

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

  const dot    = $('#cursor-dot');
  const ring   = $('#cursor-ring');
  const label  = $('#cursor-label');

  let mx = 0, my = 0;
  let rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;

    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    label.style.left = mx + 'px';
    label.style.top  = my + 'px';
  });

  rafCbs.add(() => {
    rx = lerp(rx, mx, 0.1);
    ry = lerp(ry, my, 0.1);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
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
  let targetY  = 0;
  const ease   = 0.085;

  const wrapper = document.querySelector('main') || document.body;

  window.addEventListener('wheel', e => {
    e.preventDefault();
    targetY = clamp(targetY + e.deltaY, 0, document.documentElement.scrollHeight - window.innerHeight);
  }, { passive: false });

  window.addEventListener('keydown', e => {
    const step = 120;
    if (e.key === 'ArrowDown') targetY += step;
    if (e.key === 'ArrowUp')   targetY -= step;
    if (e.key === 'PageDown')  targetY += window.innerHeight;
    if (e.key === 'PageUp')    targetY -= window.innerHeight;
    if (e.key === 'Home')      targetY = 0;
    if (e.key === 'End')       targetY = document.documentElement.scrollHeight;
    targetY = clamp(targetY, 0, document.documentElement.scrollHeight - window.innerHeight);
  });

  rafCbs.add(() => {
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
}

/* ─── HERO PARTICLES ─────────────────────────────────────── */
function initHeroParticles() {
  const canvas = $('#hero-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  function randomParticle() {
    return {
      x:    Math.random() * W,
      y:    Math.random() * H,
      r:    Math.random() * 2 + 0.5,
      vx:   (Math.random() - 0.5) * 0.3,
      vy:   -Math.random() * 0.5 - 0.1,
      life: Math.random(),
      maxLife: Math.random() * 0.6 + 0.4,
    };
  }

  for (let i = 0; i < 120; i++) particles.push(randomParticle());

  rafCbs.add(() => {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p, i) => {
      p.x  += p.vx;
      p.y  += p.vy;
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

  const hero    = $('#hero');
  const heading = $('.hero-heading');
  const bgImgs  = $('.hero-bg-images');

  let tx = 0, ty = 0;
  let cx = 0, cy = 0;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    tx = (e.clientX / rect.width  - 0.5) * 30;
    ty = (e.clientY / rect.height - 0.5) * 20;
  });

  rafCbs.add(() => {
    cx = lerp(cx, tx, 0.06);
    cy = lerp(cy, ty, 0.06);

    if (bgImgs) bgImgs.style.transform = `scale(1.1) translate(${cx * 0.3}px, ${cy * 0.3}px)`;
    if (heading) heading.style.transform = `translate(${cx * 0.1}px, ${cy * 0.1}px)`;
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

  $$('.fade-up, .fade-in, .reveal-text, .about-circle-wrap, .project-card').forEach(el => obs.observe(el));

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
  const dur    = 1800;
  const start  = performance.now();

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
  const track   = $('.h-scroll-track');
  if (!wrapper || !track) return;

  let isDown = false;
  let startX  = 0;
  let scrollLeft = 0;
  let velocity   = 0;
  let lastX      = 0;
  let momentum   = false;

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
        const rel  = (rect.left - containerRect.left) / containerRect.width;
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
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const rx   = (e.clientY - cy) / (rect.height / 2) * -10;
      const ry   = (e.clientX - cx) / (rect.width  / 2) *  10;

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
    title:  'SOCIAL MEDIA POSTER DESIGN',
    tags:   ['Social Media', 'Ad Creative', 'Marketing Design'],
    year:   '2024',
    client: 'Multiple Clients',
    role:   'Graphic Designer',
    imgClass: 'project-card-img--social',
    desc:   'Scroll-stopping social media poster designs crafted for Instagram, Facebook, and digital ad platforms. Bold visuals, cinematic color-grading and typography systems built to maximize engagement and brand recall.',
  },
  {
    title:  'YOUTUBE THUMBNAIL DESIGN',
    tags:   ['YouTube', 'Thumbnail', 'CTR Design'],
    year:   '2024',
    client: 'Content Creators',
    role:   'Thumbnail Designer',
    imgClass: 'project-card-img--yt',
    desc:   'High-CTR YouTube thumbnail designs that blend striking title typography, color-graded visuals, and focused composition to dramatically boost click-through rates and channel growth.',
  },
  {
    title:  'PACKAGING DESIGN',
    tags:   ['Packaging', 'Branding', 'Product Design'],
    year:   '2024',
    client: 'Product Brands',
    role:   'Packaging Designer',
    imgClass: 'project-card-img--packaging',
    desc:   'Custom premium product labels, structural box wraps, and packaging systems that command shelf presence. Dark luxury aesthetics with cinematic orange accents for an unforgettable unboxing experience.',
  },
  {
    title:  'LINKEDIN COVER DESIGN',
    tags:   ['LinkedIn', 'Personal Branding', 'Banner Design'],
    year:   '2024',
    client: 'Professionals & Brands',
    role:   'Brand Designer',
    imgClass: 'project-card-img--linkedin',
    desc:   'Professional LinkedIn profile banners and company page covers designed to communicate authority, expertise, and brand identity at a glance. Clean, premium layouts that convert profile views to connections.',
  },
  {
    title:  'FLYER DESIGN',
    tags:   ['Print Design', 'Promotional', 'Marketing'],
    year:   '2024',
    client: 'Events & Businesses',
    role:   'Graphic Designer',
    imgClass: 'project-card-img--flyer',
    desc:   'Impactful print and digital flyer designs for events, promotions, and business announcements. Dramatic orange lighting, bold hierarchy, and premium composition that demands attention.',
  },
  {
    title:  'UI/UX DESIGN',
    tags:   ['UI Design', 'UX Experience', 'Web Interface'],
    year:   '2024',
    client: 'Tech Startups',
    role:   'UI/UX Designer',
    imgClass: 'project-card-img--uiux',
    desc:   'User-centered dark-themed responsive web and app interfaces that prioritize sleek layouts, intuitive navigation, and premium visual language. Smooth micro-interactions and futuristic design systems.',
  },
];

function initProjectOverlay() {
  const overlay     = $('#project-overlay');
  const lens        = overlay.querySelector('.overlay-lens');
  const content     = overlay.querySelector('.overlay-content');
  const closeBtn    = overlay.querySelector('.overlay-close-btn');

  $$('.project-card').forEach((card, i) => {
    card.addEventListener('click', e => {
      const titleText = card.querySelector('.project-card-title')?.textContent.trim();
      
      if (titleText === 'Social Media Poster Design') {
        window.location.href = 'social-media-posters.html';
        return;
      }
      if (titleText === 'YouTube Thumbnail Design') {
        window.location.href = 'youtube-thumbnails.html';
        return;
      }

      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;

      // Position lens at card center
      Object.assign(lens.style, {
        width:  '10px', height: '10px',
        left:   cx + 'px', top: cy + 'px',
        transform: 'translate(-50%, -50%) scale(0)',
        transition: 'none',
      });

      const cardVisual = card.querySelector('.card-visual-inner');
      const visualHTML = cardVisual ? cardVisual.outerHTML : '';

      setTimeout(() => {
        lens.style.transition = 'transform 0.9s cubic-bezier(0.16,1,0.3,1), border-radius 0.9s cubic-bezier(0.16,1,0.3,1)';
        lens.style.transform  = 'translate(-50%, -50%) scale(30)';
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
    lens.style.transform  = 'translate(-50%, -50%) scale(0)';
    lens.style.borderRadius = '50%';
    document.body.style.overflow = '';
  }
}

/* ─── ORBIT SKILL SYSTEM ─────────────────────────────────── */
function initOrbit() {
  const system = $('.orbit-system');
  if (!system) return;

  const planets = $$('.orbit-planet', system);
  const rings   = [
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
      const size   = system.offsetWidth;
      const cx     = size / 2;
      const cy     = size / 2;
      const scale  = size / 500;
      const x = cx + Math.cos(p.angle) * p.r * scale - 26;
      const y = cy + Math.sin(p.angle) * p.r * scale - 26;
      p.el.style.left = x + 'px';
      p.el.style.top  = y + 'px';
      p.el.style.position = 'absolute';
    });
  });
}

/* ─── TESTIMONIALS CAROUSEL ──────────────────────────────── */
function initTestimonials() {
  const cards = $$('.testimonial-card');
  const dots  = $$('.t-dot');
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
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
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
      const speed  = parseFloat(el.dataset.parallax) || 0.3;
      const rect   = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const rel    = (window.innerHeight / 2 - center);
      el.style.transform = `translateY(${rel * speed}px)`;
    });
  });
}

/* ─── SERVICE CARDS STAGGER ──────────────────────────────── */
function initServiceCards() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$('.service-card').forEach((card, i) => {
          setTimeout(() => {
            card.style.transition = `opacity 0.7s, transform 0.9s cubic-bezier(0.16,1,0.3,1)`;
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, i * 80);
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const servicesSection = $('#services');
  if (servicesSection) obs.observe(servicesSection);

  $$('.service-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(40px)';
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
    const top  = 20 + Math.random() * 60;
    Object.assign(orb.style, {
      width:      '400px',
      height:     '400px',
      background: 'radial-gradient(circle, rgba(255,122,0,0.2) 0%, transparent 70%)',
      [side]:     '-150px',
      top:        top + '%',
      transform:  'translateY(-50%)',
    });
    sec.appendChild(orb);
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
    W = canvas.width  = r.width  + 120;
    H = canvas.height = r.height + 120;
  }

  resize();
  window.addEventListener('resize', () => { resize(); pts = []; for (let i = 0; i < 40; i++) pts.push(mkPt()); });

  function mkPt() {
    const angle = Math.random() * Math.PI * 2;
    const dist  = 160 + Math.random() * 120;
    const cx = W / 2, cy = H / 2;
    return {
      x:     cx + Math.cos(angle) * dist,
      y:     cy + Math.sin(angle) * dist,
      r:     Math.random() * 1.8 + 0.4,
      vx:    (Math.random() - 0.5) * 0.28,
      vy:    (Math.random() - 0.5) * 0.28,
      life:  Math.random(),
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

/* ─── FUTURISTIC HOLOGRAPHIC GRID BACKGROUND ─────────────── */
function initHologramBackground() {
  const canvas = $('#hologram-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Perspective Parameters
  const cy = H * 0.55; // Horizon Y
  const fov = H * 0.45; // Field of View projection scale
  const yFloor = 220; // 3D Y coordinate of Floor
  const yCeiling = -220; // 3D Y coordinate of Ceiling
  const zMin = 0.2; // Nearest depth
  const zMax = 4.8; // Horizon depth

  let scrollOffset = 0;
  const scrollSpeed = 0.003; // grid scrolling speed

  // Mouse interactivity
  let mouseX = W / 2;
  let mouseY = H / 2;
  let targetMouseX = W / 2;
  let targetMouseY = H / 2;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  });

  // Energy Pulses / Ripples array
  const ripples = [];
  window.addEventListener('mousedown', (e) => {
    ripples.push({
      x: e.clientX,
      y: e.clientY,
      radius: 0,
      maxRadius: 180,
      speed: 2.5,
      opacity: 0.8
    });
  });

  // Mouse moves trigger light pulses occasionally
  let lastMove = 0;
  window.addEventListener('mousemove', (e) => {
    const now = performance.now();
    if (now - lastMove > 100) { // Throttle mousemove ripples
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 60,
        speed: 1.5,
        opacity: 0.3
      });
      lastMove = now;
    }
  });

  // Floating 3D Data Particles
  const particles = [];
  const particleLabels = [
    'SYS_RUN', 'GRID_ACTIVE', '0xFA80', 'NODE_92', 'AI_CORE_UP',
    'FLOW_RATE_0.8', 'SYS_OK', 'UNIT_C9', 'SYNC_88%', 'AI_STREAM_1',
    '0x0C7A', 'DB_LINK_ACTIVE', 'GRID_v2.6', 'ALGO_LOAD', 'PROCESSOR_0'
  ];

  for (let i = 0; i < 45; i++) {
    particles.push(create3DParticle(true));
  }

  function create3DParticle(initRandomZ = false) {
    return {
      x: (Math.random() - 0.5) * 1200,
      y: (Math.random() - 0.5) * 400,
      z: initRandomZ ? Math.random() * (zMax - zMin) + zMin : zMax,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      speedZ: -0.0015 - Math.random() * 0.002, // moving towards camera
      size: Math.random() * 1.5 + 0.8,
      label: particleLabels[Math.floor(Math.random() * particleLabels.length)],
      showLabel: Math.random() > 0.8
    };
  }

  // Holographic Rings (sonar style) expanding on floor/ceiling
  const rings = [];
  for (let i = 0; i < 4; i++) {
    rings.push(createHoloRing(true));
  }

  function createHoloRing(initRandomRadius = false) {
    const isFloor = Math.random() > 0.5;
    return {
      x: (Math.random() - 0.5) * 600,
      y: isFloor ? yFloor : yCeiling,
      z: Math.random() * (zMax - 1.2) + 1.2,
      radius: initRandomRadius ? Math.random() * 150 : 0,
      maxRadius: Math.random() * 120 + 80,
      speed: Math.random() * 0.4 + 0.2,
      opacity: Math.random() * 0.6 + 0.4
    };
  }

  // Orange light beams crossing occasionally
  let beamSweep1 = { y: H * 0.3, height: 1.5, speed: 0.35, opacity: 0.15, dir: 1 };
  let beamSweep2 = { x: W * 0.2, width: 2.0, speed: 0.2, opacity: 0.1, dir: 1 };

  // Slowly moving Scan Lines
  let scanlineY = 0;

  // Project 3D to 2D
  function project(x, y, z) {
    const cx = W * 0.5;
    return {
      x: cx + (x / z) * fov,
      y: cy + (y / z) * fov
    };
  }

  // Hook into the main RAF loop
  rafCbs.add(() => {
    // 1. Clear background and fill with dark premium color
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, W, H);

    // Smooth mouse coordinates interpolation
    mouseX = lerp(mouseX, targetMouseX, 0.08);
    mouseY = lerp(mouseY, targetMouseY, 0.08);

    scrollOffset += scrollSpeed;

    // 2. Grids (Floor and Ceiling)
    // Draw Longitudinal lines (converging to horizon)
    const xMax = 1200;
    const xStep = 100;

    // Set line gradients for floor and ceiling grids to fade at horizon and screen edges
    const gradFloor = ctx.createLinearGradient(0, cy, 0, H);
    gradFloor.addColorStop(0, 'rgba(255, 122, 0, 0)');
    gradFloor.addColorStop(0.18, 'rgba(255, 122, 0, 0.09)');
    gradFloor.addColorStop(0.8, 'rgba(255, 122, 0, 0.09)');
    gradFloor.addColorStop(1, 'rgba(255, 122, 0, 0)');

    const gradCeiling = ctx.createLinearGradient(0, cy, 0, 0);
    gradCeiling.addColorStop(0, 'rgba(255, 122, 0, 0)');
    gradCeiling.addColorStop(0.18, 'rgba(255, 122, 0, 0.09)');
    gradCeiling.addColorStop(0.8, 'rgba(255, 122, 0, 0.09)');
    gradCeiling.addColorStop(1, 'rgba(255, 122, 0, 0)');

    // Floor Grid Longitudinal Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = gradFloor;
    ctx.beginPath();
    for (let x = -xMax; x <= xMax; x += xStep) {
      const pNear = project(x, yFloor, zMin);
      const pFar = project(x, yFloor, zMax);
      ctx.moveTo(pNear.x, pNear.y);
      ctx.lineTo(pFar.x, pFar.y);
    }
    ctx.stroke();

    // Ceiling Grid Longitudinal Lines
    ctx.strokeStyle = gradCeiling;
    ctx.beginPath();
    for (let x = -xMax; x <= xMax; x += xStep) {
      const pNear = project(x, yCeiling, zMin);
      const pFar = project(x, yCeiling, zMax);
      ctx.moveTo(pNear.x, pNear.y);
      ctx.lineTo(pFar.x, pFar.y);
    }
    ctx.stroke();

    // Draw Transverse lines (Horizontal lines scrolling in perspective)
    // Floor & Ceiling Transverse Lines
    const numTransverse = 25;
    const spacing = (zMax - zMin) / numTransverse;

    for (let i = 0; i < numTransverse; i++) {
      const zVal = zMin + i * spacing + (scrollOffset % spacing);
      if (zVal >= zMax) continue;

      // Sine fadeout: fades out near camera (zMin) and near horizon (zMax)
      const alpha = Math.sin(Math.PI * (zVal - zMin) / (zMax - zMin)) * 0.12;

      ctx.strokeStyle = `rgba(255, 122, 0, ${alpha})`;
      ctx.lineWidth = 0.8;

      // Floor line
      const floorLeft = project(-xMax, yFloor, zVal);
      const floorRight = project(xMax, yFloor, zVal);
      ctx.beginPath();
      ctx.moveTo(floorLeft.x, floorLeft.y);
      ctx.lineTo(floorRight.x, floorRight.y);
      ctx.stroke();

      // Ceiling line
      const ceilLeft = project(-xMax, yCeiling, zVal);
      const ceilRight = project(xMax, yCeiling, zVal);
      ctx.beginPath();
      ctx.moveTo(ceilLeft.x, ceilLeft.y);
      ctx.lineTo(ceilRight.x, ceilRight.y);
      ctx.stroke();
    }

    // 3. Holographic Rings expanding along planes
    rings.forEach((ring, idx) => {
      ring.radius += ring.speed;
      if (ring.radius > ring.maxRadius) {
        rings[idx] = createHoloRing(false);
        return;
      }

      const ringAlpha = (1 - ring.radius / ring.maxRadius) * Math.sin(Math.PI * (ring.z - zMin) / (zMax - zMin)) * 0.15;
      if (ringAlpha <= 0) return;

      const center = project(ring.x, ring.y, ring.z);
      const radX = (ring.radius / ring.z) * 1.5;
      const radY = radX * 0.18; // Perspective flattening ratio

      ctx.strokeStyle = `rgba(255, 122, 0, ${ringAlpha})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(center.x, center.y, radX, radY, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 4. Subtle depth fog at the horizon
    const fogHeight = H * 0.12;
    const fogGrad = ctx.createLinearGradient(0, cy - fogHeight, 0, cy + fogHeight);
    fogGrad.addColorStop(0, 'rgba(5, 5, 8, 0)');
    fogGrad.addColorStop(0.35, '#050508');
    fogGrad.addColorStop(0.65, '#050508');
    fogGrad.addColorStop(1, 'rgba(5, 5, 8, 0)');

    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, cy - fogHeight, W, fogHeight * 2);

    // 5. Floating 3D Data Particles
    particles.forEach((p, idx) => {
      p.z += p.speedZ;
      p.x += p.vx * 0.05;
      p.y += p.vy * 0.05;

      if (p.z <= zMin) {
        particles[idx] = create3DParticle(false);
        return;
      }

      const pos = project(p.x, p.y, p.z);
      
      // Calculate opacity and size
      const alpha = Math.sin(Math.PI * (p.z - zMin) / (zMax - zMin)) * 0.35;
      const sizeOnScreen = (p.size / p.z) * 1.2;

      // Draw particle dot
      if (pos.x >= 0 && pos.x <= W && pos.y >= 0 && pos.y <= H) {
        ctx.fillStyle = `rgba(255, 122, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, sizeOnScreen, 0, Math.PI * 2);
        ctx.fill();

        // Draw small tech label
        if (p.showLabel && alpha > 0.08 && p.z < 2.5) {
          ctx.strokeStyle = `rgba(255, 122, 0, ${alpha * 0.3})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          ctx.lineTo(pos.x + 12, pos.y - 10);
          ctx.lineTo(pos.x + 24, pos.y - 10);
          ctx.stroke();

          ctx.fillStyle = `rgba(255, 122, 0, ${alpha * 0.75})`;
          ctx.font = '7px monospace';
          ctx.fillText(p.label, pos.x + 28, pos.y - 8);
        }
      }
    });

    // 6. Orange Light Beams sweeping
    // Horizontal scanning sweep line (moves down)
    scanlineY = (scanlineY + 0.8) % H;
    const scanGrad = ctx.createLinearGradient(0, scanlineY - 120, 0, scanlineY + 120);
    scanGrad.addColorStop(0, 'rgba(255, 122, 0, 0)');
    scanGrad.addColorStop(0.5, 'rgba(255, 122, 0, 0.016)');
    scanGrad.addColorStop(1, 'rgba(255, 122, 0, 0)');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, scanlineY - 120, W, 240);

    // Faint horizontal laser line
    ctx.strokeStyle = 'rgba(255, 122, 0, 0.04)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, scanlineY);
    ctx.lineTo(W, scanlineY);
    ctx.stroke();

    // Occasional crossing light beams
    beamSweep1.y += beamSweep1.speed * beamSweep1.dir;
    if (beamSweep1.y > H || beamSweep1.y < 0) beamSweep1.dir *= -1;

    const bGrad1 = ctx.createLinearGradient(0, beamSweep1.y - 4, 0, beamSweep1.y + 4);
    bGrad1.addColorStop(0, 'rgba(255, 122, 0, 0)');
    bGrad1.addColorStop(0.5, `rgba(255, 122, 0, ${beamSweep1.opacity})`);
    bGrad1.addColorStop(1, 'rgba(255, 122, 0, 0)');
    ctx.fillStyle = bGrad1;
    ctx.fillRect(0, beamSweep1.y - 4, W, 8);

    beamSweep2.x += beamSweep2.speed * beamSweep2.dir;
    if (beamSweep2.x > W || beamSweep2.x < 0) beamSweep2.dir *= -1;

    const bGrad2 = ctx.createLinearGradient(beamSweep2.x - 50, 0, beamSweep2.x + 50, 0);
    bGrad2.addColorStop(0, 'rgba(255, 122, 0, 0)');
    bGrad2.addColorStop(0.5, `rgba(255, 122, 0, ${beamSweep2.opacity})`);
    bGrad2.addColorStop(1, 'rgba(255, 122, 0, 0)');
    ctx.fillStyle = bGrad2;
    ctx.fillRect(beamSweep2.x - 50, 0, 100, H);

    // 7. Interactive Energy Pulses (Ripples) from Mouse
    ripples.forEach((rip, idx) => {
      rip.radius += rip.speed;
      if (rip.radius > rip.maxRadius) {
        ripples.splice(idx, 1);
        return;
      }
      const ripAlpha = (1 - rip.radius / rip.maxRadius) * rip.opacity;
      
      // Draw circular ring
      ctx.strokeStyle = `rgba(255, 122, 0, ${ripAlpha * 0.15})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Subtle glow ring
      ctx.strokeStyle = `rgba(255, 122, 0, ${ripAlpha * 0.05})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 8. Custom Tech Cursor UI reticle on the background canvas
    if (!isMobile()) {
      ctx.strokeStyle = 'rgba(255, 122, 0, 0.15)';
      ctx.lineWidth = 0.5;

      // Small rotating brackets or lines around cursor
      const rot = (performance.now() * 0.0008) % (Math.PI * 2);
      
      ctx.save();
      ctx.translate(mouseX, mouseY);
      ctx.rotate(rot);
      
      // Draw outer target ticks
      ctx.beginPath();
      for (let a = 0; a < 4; a++) {
        const angle = (a * Math.PI) / 2;
        const x1 = Math.cos(angle) * 12;
        const y1 = Math.sin(angle) * 12;
        const x2 = Math.cos(angle) * 18;
        const y2 = Math.sin(angle) * 18;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.stroke();
      ctx.restore();

      // Mouse position coordinates display text on canvas (aligned next to cursor)
      ctx.fillStyle = 'rgba(255, 122, 0, 0.25)';
      ctx.font = '6.5px monospace';
      ctx.fillText(`[X:${Math.round(mouseX)} Y:${Math.round(mouseY)}]`, mouseX + 15, mouseY + 18);
    }
  });
}

/* ─── INIT ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
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
});
