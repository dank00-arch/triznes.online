/* TRIZNES VISUAL BOOST v5 — scroll reveal + ambient particles + real character photos.
   No dependencies. Loads after shell. */
(() => {
  'use strict';

  /* ── 1. SCROLL REVEAL ── */
  const sections = document.querySelectorAll('.section, .panel, .bezliki, .hero, .manifesto');
  sections.forEach(el => el.classList.add('v5-reveal'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('v5-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  sections.forEach(el => observer.observe(el));

  /* ── 2. AMBIENT PARTICLES (canvas behind content) ── */
  function initParticles() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (document.querySelector('.v5-particles')) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'v5-particles';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    const PARTICLE_COUNT = Math.min(Math.max(Math.floor(innerWidth / 28), 12), 36);
    const palettes = {
      paradise: [[0, 223, 255], [0, 214, 163], [202, 255, 40], [255, 203, 33]],
      cyber: [[40, 119, 255], [53, 233, 255], [128, 88, 255], [255, 46, 200]]
    };
    let activePalette = palettes[document.body.dataset.world] || palettes.paradise;

    class Particle {
      constructor() { this.reset(true); }
      setColor() { this.color = activePalette[Math.floor(Math.random() * activePalette.length)]; }
      reset(init) {
        this.x = Math.random() * w;
        this.y = init ? Math.random() * h : h + 10;
        this.r = Math.random() * 1.5 + 0.4;
        this.speed = Math.random() * 0.35 + 0.08;
        this.drift = (Math.random() - 0.5) * 0.3;
        this.setColor();
        this.alpha = Math.random() * 0.3 + 0.1;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.01 + 0.005;
      }
      update() {
        this.y -= this.speed;
        this.x += this.drift + Math.sin(this.pulse) * 0.15;
        this.pulse += this.pulseSpeed;
        if (this.y < -10) this.reset(false);
      }
      draw(ctx) {
        const a = this.alpha * (0.7 + 0.3 * Math.sin(this.pulse));
        ctx.beginPath();
        ctx.arc(this.x * dpr, this.y * dpr, this.r * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${a})`;
        ctx.fill();
      }
    }

    const particles = [];
    let frameId = 0;
    let running = false;
    let lastFrame = 0;
    const frameInterval = 1000 / 30;
    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      particles.forEach(p => { p.x = Math.min(p.x, w); p.y = Math.min(p.y, h); });
    }

    function animate(now) {
      frameId = 0;
      if (!running || document.hidden) return;
      if (now - lastFrame >= frameInterval) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(ctx); });
        lastFrame = now;
      }
      frameId = requestAnimationFrame(animate);
    }

    resize();
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
    addEventListener('resize', resize, { passive: true });
    const start = () => {
      if (running || document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      running = true;
      lastFrame = 0;
      frameId = requestAnimationFrame(animate);
    };
    const stop = () => {
      running = false;
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
    };
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
    if (motionPreference.addEventListener) motionPreference.addEventListener('change', event => event.matches ? stop() : start());
    document.addEventListener('triznes:world-change', event => {
      const mode = event.detail && event.detail.world;
      if (!palettes[mode]) return;
      activePalette = palettes[mode];
      particles.forEach(p => p.setColor());
    });
    start();
  }

  // Delay particles so they don't block first paint
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initParticles);
  } else {
    setTimeout(initParticles, 800);
  }

  /* ── 3. REAL CHARACTER PHOTOS ── */
  // Only verified character slugs can select bundled portraits. Never infer identity from initials.
  const PHOTO_BY_SLUG = {
    'daniel':       './assets/characters-v4/daniel-cinematic-v1.webp',
    'liberty':      './assets/characters-v4/liberty-abundance-v1.webp',
    'vsevolod':     './assets/characters-v4/vsevolod-kim-collider-v1.webp',
    'vsevolod-kim': './assets/characters-v4/vsevolod-kim-collider-v1.webp',
  };

  function injectPhotos() {
    // Inject only where the containing card identifies the character by a verified slug.
    document.querySelectorAll('.tc-monogram:not([hidden])').forEach(mono => {
      const owner = mono.closest('[data-character]');
      const slug = owner?.getAttribute('data-character');
      const photo = PHOTO_BY_SLUG[slug];
      if (!photo) return;
      const parent = mono.parentElement;
      if (!parent) return;
      if (parent.querySelector('img.v5-photo')) return;
      const img = document.createElement('img');
      img.src = photo; img.alt = slug; img.className = 'v5-photo';
      img.loading = 'lazy'; img.decoding = 'async';
      // Ensure parent is positioned for absolute fill
      const ps = getComputedStyle(parent).position;
      if (ps === 'static') parent.style.position = 'relative';
      parent.style.overflow = 'hidden';
      img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;border-radius:inherit';
      img.onerror = () => { img.hidden = true; mono.hidden = false; };
      mono.hidden = true;
      parent.appendChild(img);
    });
    // Inject into explicit media slots on the entry/home pages.
    document.querySelectorAll('.media[data-character]').forEach(media => {
      if (media.querySelector('img.v5-photo')) return;
      const slug = media.getAttribute('data-character');
      const photo = PHOTO_BY_SLUG[slug];
      if (!photo) return;
      // Hide placeholder
      const ph = media.querySelector('.ph');
      if (ph) ph.style.display = 'none';
      const fmt = media.querySelector('.fmt');
      if (fmt) fmt.style.display = 'none';
      const img = document.createElement('img');
      img.src = photo; img.alt = slug; img.className = 'v5-photo';
      img.loading = 'lazy'; img.decoding = 'async';
      img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;border-radius:inherit';
      img.onerror = () => { img.hidden = true; if(ph) ph.style.display = ''; if(fmt) fmt.style.display = ''; };
      media.appendChild(img);
    });
  }

  // Run after data script hydrates (it loads async)
  setTimeout(injectPhotos, 1500);
  setTimeout(injectPhotos, 3500);
  // Also watch for DOM changes from data script
  const photoObserver = new MutationObserver(() => { injectPhotos(); });
  photoObserver.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => photoObserver.disconnect(), 8000);

  /* ── 4. SMOOTH SECTION TRANSITIONS ON SCROLL ── */
  // Parallax on hero core emblem
  const core = document.querySelector('.hero-cine .core, .hero .core');
  if (core && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = scrollY * 0.12;
        const s = 1 - Math.min(scrollY / 2000, 0.15);
        core.style.transform = `translateY(${y}px) scale(${s})`;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ── 5. HOVER GLOW ON CARDS (follow cursor, mouse/trackpad only) ── */
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const card = e.target.closest('.card, .portal, .bcard, .step');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
      const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
      card.style.setProperty('--glow-x', x + '%');
      card.style.setProperty('--glow-y', y + '%');
      card.classList.add('v5-glow-follow');
    }, { passive: true });
  }
})();
