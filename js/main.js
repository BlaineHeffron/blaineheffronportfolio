/* ============================================
   Blaine Heffron — Portfolio
   Main JS: Canvas, Scroll, Theme, Publications
   ============================================ */

(function () {
  'use strict';

  // ---- Theme Toggle ----
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '\u263D' : '\u2600';
    }
  }

  const saved = localStorage.getItem('theme');
  if (saved) {
    setTheme(saved);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    setTheme('light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  // ---- Mobile Nav ----
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      const open = hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // ---- Sticky Nav Background ----
  const nav = document.querySelector('.nav');
  let currentScrollY = window.scrollY || 0;
  let navScrolled = false;
  let scrollTicking = false;

  function onScrollRaf() {
    if (!nav) return;
    const shouldScrollClass = currentScrollY > 40;
    if (shouldScrollClass !== navScrolled) {
      nav.classList.toggle('scrolled', shouldScrollClass);
      navScrolled = shouldScrollClass;
    }
    scrollTicking = false;
  }

  function onScroll() {
    currentScrollY = window.scrollY || 0;
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(onScrollRaf);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScrollRaf();

  // ---- Scroll Reveal ----
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach(function (el) {
    observer.observe(el);
  });

  // ---- Hero Canvas: Heptagonal Lattice (G₂ Symmetry) ----
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, points, connections;
    const isMobile = window.innerWidth < 768;
    const RINGS = isMobile ? 3 : 5;
    const BASE_RADIUS = isMobile ? 120 : 200;
    const RING_GAP = isMobile ? 55 : 70;

    function createLattice() {
      points = [];
      connections = [];

      // Center point
      points.push({ x: 0, y: 0, ring: 0, angle: 0, baseX: 0, baseY: 0 });

      // Concentric rings of 7n points
      for (let r = 1; r <= RINGS; r++) {
        const count = 7 * r;
        const radius = BASE_RADIUS + RING_GAP * (r - 1);
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          points.push({ x: x, y: y, ring: r, angle: angle, baseX: x, baseY: y });
        }
      }

      // Connect adjacent points within rings and to nearest in adjacent rings
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].baseX - points[j].baseX;
          const dy = points[i].baseY - points[j].baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const threshold = RING_GAP * 1.4;
          if (dist < threshold) {
            connections.push([i, j, dist]);
          }
        }
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      createLattice();
    }

    let time = 0;
    let scrollFactor = 0;

    function animate() {
      time += 0.004;
      scrollFactor = Math.min(currentScrollY / (h || 1), 1);

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w * 0.62, h * 0.48);

      const globalAlpha = 0.15 * (1 - scrollFactor * 0.8);
      const isDark = root.getAttribute('data-theme') !== 'light';
      const lineColor = isDark ? '0, 180, 236' : '0, 100, 170';
      const dotColor = isDark ? '0, 200, 255' : '0, 90, 160';

      // Animate points
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (p.ring === 0) continue;
        const speed = 0.15 / p.ring;
        const breath = Math.sin(time * 0.8 + p.ring * 0.7) * 6;
        const rotOffset = time * speed;
        const radius = Math.sqrt(p.baseX * p.baseX + p.baseY * p.baseY) + breath;
        const angle = p.angle + rotOffset;
        p.x = Math.cos(angle) * radius;
        p.y = Math.sin(angle) * radius;
      }

      // Draw connections
      const maxDist = RING_GAP * 1.4;
      for (let c = 0; c < connections.length; c++) {
        const a = points[connections[c][0]];
        const b = points[connections[c][1]];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const alpha = globalAlpha * Math.max(0, 1 - dist / maxDist) * 0.6;
        if (alpha < 0.005) continue;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = 'rgba(' + lineColor + ',' + alpha + ')';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Draw points
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const size = p.ring === 0 ? 2.5 : 1.5;
        const alpha = globalAlpha * (p.ring === 0 ? 1.2 : 0.8);
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + dotColor + ',' + alpha + ')';
        ctx.fill();
      }

      ctx.restore();
      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
  }

  // ---- Active Nav Link ----
  var sections = document.querySelectorAll('section[id]');
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  var sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navAnchors.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach(function (s) {
    sectionObserver.observe(s);
  });

})();
