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
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;z-index:-2;pointer-events:none;opacity:.5';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    const PARTICLE_COUNT = Math.min(Math.floor(innerWidth / 18), 55);

    class Particle {
      constructor() { this.reset(true); }
      reset(init) {
        this.x = Math.random() * w;
        this.y = init ? Math.random() * h : h + 10;
        this.r = Math.random() * 1.5 + 0.4;
        this.speed = Math.random() * 0.35 + 0.08;
        this.drift = (Math.random() - 0.5) * 0.3;
        const palettes = [
          [90, 120, 255],  // sapphire
          [52, 231, 255],  // cyan
          [255, 43, 214],  // pink
          [255, 208, 106], // gold
          [139, 92, 255],  // violet
        ];
        const c = palettes[Math.floor(Math.random() * palettes.length)];
        this.color = c;
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
    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    }

    let rafId = null;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(ctx); });
      rafId = requestAnimationFrame(animate);
    }
    function startAnim() { if (rafId === null && !document.hidden) rafId = requestAnimationFrame(animate); }
    function stopAnim() { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } }

    resize();
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
    addEventListener('resize', resize, { passive: true });
    // Не жечь кадры в скрытой вкладке: ставим анимацию на паузу
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAnim(); else startAnim();
    });
    startAnim();
  }

  // Delay particles so they don't block first paint
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initParticles);
  } else {
    setTimeout(initParticles, 800);
  }

  /* ── 3. REAL CHARACTER PHOTOS ── */
  // Строго по проверенному slug/ID персонажа, НЕ по инициалам: случайный
  // человек с теми же буквами не должен получить чужое лицо. Неизвестный
  // slug остаётся с инициалами/нейтральным placeholder.
  const PHOTO_BY_SLUG = {
    'daniel':       './assets/characters-v4/daniel-cinematic-v1.webp',
    'liberty':      './assets/characters-v4/liberty-abundance-v1.webp',
    'vsevolod':     './assets/characters-v4/vsevolod-kim-collider-v1.webp',
    'vsevolod-kim': './assets/characters-v4/vsevolod-kim-collider-v1.webp',
  };

  function injectPhotos() {
    // Подставляем портрет ТОЛЬКО там, где разметка несёт точный data-character
    // и этот slug есть в PHOTO_BY_SLUG. Неизвестный slug — ничего не трогаем,
    // остаётся нейтральный placeholder/инициалы.
    document.querySelectorAll('[data-character]').forEach(host => {
      // Портрет уже есть (адаптер данных при гидратации или готовая разметка) — не дублируем.
      if (host.querySelector('img:not([hidden])')) return;
      const slug = host.getAttribute('data-character');
      const photo = PHOTO_BY_SLUG[slug];
      if (!photo) return;
      // спрятать placeholder, подпись формата и иконку-заглушку аватара
      const ph = host.querySelector('.ph');
      if (ph) ph.style.display = 'none';
      const fmt = host.querySelector('.fmt');
      if (fmt) fmt.style.display = 'none';
      const icon = host.querySelector(':scope > svg');
      if (icon) icon.style.display = 'none';
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      host.style.overflow = 'hidden';
      const img = document.createElement('img');
      img.src = photo; img.alt = slug; img.className = 'v5-photo';
      img.loading = 'lazy'; img.decoding = 'async';
      img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;border-radius:inherit';
      img.onerror = () => { img.hidden = true; if (ph) ph.style.display = ''; if (icon) icon.style.display = ''; };
      host.appendChild(img);
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

  /* ── 5. HOVER GLOW ON CARDS (follow cursor) ── */
  // Только на устройствах с настоящим hover: на тач это лишняя работа и мешает тапу/свайпу.
  if (matchMedia('(hover:hover) and (pointer:fine)').matches &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.addEventListener('pointermove', e => {
      const card = e.target.closest('.card, .portal, .bcard, .step');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
      const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
      card.style.setProperty('--glow-x', x + '%');
      card.style.setProperty('--glow-y', y + '%');
      if (!card.dataset.v5glow) {
        card.dataset.v5glow = '1';
        card.style.background = `
          radial-gradient(400px circle at var(--glow-x) var(--glow-y), rgba(120,150,255,.06), transparent 55%),
          linear-gradient(145deg, rgba(255,255,255,.07), rgba(255,255,255,.015))`;
      }
    }, { passive: true });
  }
})();
