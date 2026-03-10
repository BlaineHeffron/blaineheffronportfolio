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
    themeIcon.textContent = theme === 'dark' ? '\u263D' : '\u2600';
  }

  const saved = localStorage.getItem('theme');
  if (saved) {
    setTheme(saved);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    setTheme('light');
  }

  themeToggle.addEventListener('click', function () {
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  // ---- Mobile Nav ----
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks = document.getElementById('nav-links');

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

  // ---- Sticky Nav Background ----
  const nav = document.querySelector('.nav');
  let lastScroll = 0;

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    lastScroll = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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
      ctx.scale(dpr, dpr);
      createLattice();
    }

    let time = 0;
    let scrollFactor = 0;

    function animate() {
      time += 0.004;
      scrollFactor = Math.min(window.scrollY / (h || 1), 1);

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

  // ---- Publications ----
  var publications = [
    {
      title: 'Machine learning for single-ended event reconstruction in PROSPECT experiment',
      authors: 'M. Andriamirado et al. (PROSPECT Collaboration)',
      journal: 'JINST',
      volume: '20',
      pages: 'P08006',
      year: 2025,
      doi: '10.1088/1748-0221/20/08/P08006',
      featured: true
    },
    {
      title: 'Final Search for Short-Baseline Neutrino Oscillations with the PROSPECT-I Detector at HFIR',
      authors: 'H.P. Mumm, M. Andriamirado et al.',
      journal: 'Preprint',
      year: 2024,
      featured: true
    },
    {
      title: 'Reactor Antineutrino Directionality Measurement with the PROSPECT-I Detector',
      authors: 'H. Mumm, M. Andriamirado et al.',
      journal: 'Preprint',
      year: 2024,
      featured: true
    },
    {
      title: 'Final Measurement of the \u00B2\u00B3\u2075U Antineutrino Energy Spectrum with the PROSPECT-I Detector at HFIR',
      authors: 'M. Andriamirado, A.B. Balantekin, ... B. Heffron, ... et al. (PROSPECT Collaboration)',
      journal: 'Phys. Rev. Lett.',
      volume: '131',
      pages: '021802',
      year: 2023,
      doi: '10.1103/PhysRevLett.131.021802',
      featured: true
    },
    {
      title: 'Joint Measurement of the \u00B2\u00B3\u2075U Antineutrino Spectrum by PROSPECT and STEREO',
      authors: 'H. Almazan, M. Andriamirado et al.',
      journal: 'Phys. Rev. Lett.',
      volume: '128',
      pages: '081802',
      year: 2022,
      doi: null
    },
    {
      title: 'Joint Determination of Reactor Antineutrino Spectra from \u00B2\u00B3\u2075U and \u00B2\u00B3\u2079Pu Fission by Daya Bay and PROSPECT',
      authors: 'F.P. An, M. Andriamirado et al.',
      journal: 'Phys. Rev. Lett.',
      volume: '128',
      pages: '081801',
      year: 2022,
      doi: null
    },
    {
      title: 'PROSPECT-II Physics Opportunities',
      authors: 'M. Andriamirado et al.',
      journal: 'J. Phys. G',
      volume: '49',
      pages: '070501',
      year: 2022,
      doi: null
    },
    {
      title: 'Calibration Strategy of the PROSPECT-II Detector with External and Intrinsic Sources',
      authors: 'M. Andriamirado et al.',
      journal: 'arXiv:2211.09582',
      year: 2022,
      doi: null
    },
    {
      title: 'Limits on Sub-GeV Dark Matter from the PROSPECT Reactor Antineutrino Experiment',
      authors: 'M. Andriamirado et al.',
      journal: 'Phys. Rev. D',
      volume: '104',
      pages: '012009',
      year: 2021,
      doi: null
    },
    {
      title: 'LEGEND-1000 Preconceptual Design Report',
      authors: 'N. Abgrall et al.',
      journal: 'arXiv:2107.11462',
      year: 2021,
      doi: null
    },
    {
      title: 'Nonfuel Antineutrino Contributions in the ORNL High Flux Isotope Reactor (HFIR)',
      authors: 'A.B. Balantekin et al.',
      journal: 'Phys. Rev. C',
      volume: '101',
      pages: '054605',
      year: 2020,
      doi: null
    },
    {
      title: 'The PROSPECT Reactor Antineutrino Experiment',
      authors: 'J. Ashenfelter et al.',
      journal: 'Nucl. Instrum. Methods A',
      volume: '922',
      pages: '287\u2013309',
      year: 2019,
      doi: null
    },
    {
      title: 'First Search for Short-Baseline Neutrino Oscillations at HFIR with PROSPECT',
      authors: 'PROSPECT Collaboration, J. Ashenfelter et al.',
      journal: 'Phys. Rev. Lett.',
      volume: '121',
      pages: '251802',
      year: 2018,
      doi: null
    },
    {
      title: 'Performance of a Segmented \u2076Li-Loaded Liquid Scintillator Detector for the PROSPECT Experiment',
      authors: 'J. Ashenfelter et al.',
      journal: 'JINST',
      volume: '13',
      pages: 'P06023',
      year: 2018,
      doi: null
    },
    {
      title: 'Proton Elastic Scattering at 200A MeV and High Momentum Transfers as a Probe of the Nuclear Matter Density of \u2076He',
      authors: 'S. Chebotaryov, S. Sakaguchi et al.',
      journal: 'Prog. Theor. Exp. Phys.',
      volume: '2018',
      pages: '053D01',
      year: 2018,
      doi: null
    },
    {
      title: 'Characterization of Reactor Background Radiation at HFIR for the PROSPECT Experiment',
      authors: 'B.A. Heffron',
      journal: "Master's Thesis, University of Tennessee",
      year: 2017,
      doi: null,
      featured: true
    },
    {
      title: 'The PROSPECT Physics Program',
      authors: 'J. Ashenfelter et al.',
      journal: 'J. Phys. G',
      volume: '43',
      pages: '113001',
      year: 2016,
      doi: null
    },
    {
      title: 'Background Radiation Measurements at High Power Research Reactors',
      authors: 'J. Ashenfelter et al.',
      journal: 'Nucl. Instrum. Methods A',
      volume: '806',
      pages: '401\u2013419',
      year: 2016,
      doi: null
    },
    {
      title: 'Decays of the Three Top Contributors to the Reactor Antineutrino High-Energy Spectrum Studied with Total Absorption Spectroscopy',
      authors: 'B.C. Rasco et al.',
      journal: 'Phys. Rev. Lett.',
      volume: '117',
      pages: '092501',
      year: 2016,
      doi: null
    },
    {
      title: 'Light Collection and Pulse-Shape Discrimination in Elongated Scintillator Cells for PROSPECT',
      authors: 'J. Ashenfelter et al.',
      journal: 'JINST',
      volume: '10',
      pages: 'P11004',
      year: 2015,
      doi: null
    },
    {
      title: 'Relationship Between Boundary Layer Heights and Growth Rates with Ground-Level Ozone in Houston, Texas',
      authors: 'C.L. Haman, E. Couzo, J.H. Flynn, W. Vizuete, B. Heffron, B.L. Lefer',
      journal: 'J. Geophys. Res. Atmos.',
      volume: '119',
      pages: '6230\u20136245',
      year: 2014,
      doi: null
    },
    {
      title: 'PROSPECT \u2014 A Precision Reactor Oscillation and Spectrum Experiment at Short Baselines',
      authors: 'J. Ashenfelter et al.',
      journal: 'arXiv:1309.7647',
      year: 2013,
      doi: null
    }
  ];

  // First 6 publications are pre-rendered in HTML for SEO.
  // JS appends the remaining ones as hidden (expandable).
  var HTML_PRERENDERED = 6;
  var pubList = document.getElementById('pub-list');
  var pubToggle = document.getElementById('pub-toggle');

  if (pubList) {
    publications.forEach(function (pub, i) {
      if (i < HTML_PRERENDERED) return; // already in HTML

      var li = document.createElement('li');
      li.className = 'pub-item pub-hidden';

      var titleHtml = pub.title;
      if (pub.doi) {
        titleHtml = '<a href="https://doi.org/' + pub.doi + '" target="_blank" rel="noopener">' + pub.title + '</a>';
      }

      var journalLine = '<em>' + pub.journal + '</em>';
      if (pub.volume) journalLine += ' <strong>' + pub.volume + '</strong>';
      if (pub.pages) journalLine += ', ' + pub.pages;

      var authorsHtml = pub.authors.replace(/(Heffron|B\.\s*Heffron|B\.A\.\s*Heffron)/gi, '<span class="self">$1</span>');

      li.innerHTML =
        '<div class="pub-title">' + titleHtml + '</div>' +
        '<div class="pub-authors">' + authorsHtml + '</div>' +
        '<div class="pub-journal">' + journalLine + ' (' + pub.year + ')</div>';

      pubList.appendChild(li);
    });
  }

  if (pubToggle) {
    pubToggle.addEventListener('click', function () {
      var hidden = pubList.querySelectorAll('.pub-hidden');
      var expanded = pubToggle.classList.toggle('expanded');
      pubToggle.setAttribute('aria-expanded', expanded);
      hidden.forEach(function (el) {
        el.classList.toggle('show');
      });
      pubToggle.querySelector('span').textContent = expanded
        ? 'Show fewer'
        : 'Show all publications';
    });
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
