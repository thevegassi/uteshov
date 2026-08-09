(() => {
  'use strict';

  // ---- Always resume on Hero, even after a back/forward (bfcache) restore ----
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) window.scrollTo(0, 0);
  });

  // ---- Splash / preload screen ----
  (function initSplash() {
    const splash = document.getElementById('splash');
    if (!splash) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minDisplay = prefersReduced ? 0 : 1300;
    const start = Date.now();
    let hidden = false;

    function hide() {
      if (hidden) return;
      hidden = true;
      splash.classList.add('is-hidden');
      document.body.classList.remove('is-loading');
      // Cues the Hero photo wipe-up reveal and title shine sweep so they
      // land right as the splash clears, instead of popping in unseen behind it.
      document.body.classList.add('hero-revealed');
      setTimeout(() => splash.remove(), 700);
    }

    document.body.classList.add('is-loading');

    window.addEventListener('load', () => {
      const elapsed = Date.now() - start;
      setTimeout(hide, Math.max(0, minDisplay - elapsed));
    });

    // Safety net in case the load event never fires (slow/blocked resource).
    setTimeout(hide, 4000);
  })();

  // ---- Mobile nav toggle ----
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // ---- Countdown to the nearest upcoming show ----
  (function initCountdown() {
    const countdownEl = document.getElementById('countdown');
    if (!countdownEl) return;

    const shows = Array.from(document.querySelectorAll('.tour-item[data-date]'))
      .map((el) => ({ el, date: new Date(el.dataset.date) }))
      .filter((show) => !Number.isNaN(show.date.getTime()));

    const pad = (n) => String(n).padStart(2, '0');
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-mins');
    const secsEl = document.getElementById('cd-secs');
    const cityEl = document.getElementById('countdown-city');

    let timer = null;

    function tick() {
      const next = shows
        .filter((show) => show.date.getTime() > Date.now())
        .sort((a, b) => a.date - b.date)[0];

      if (!next) {
        clearInterval(timer);
        countdownEl.remove();
        return;
      }

      const diff = next.date.getTime() - Date.now();
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      daysEl.textContent = pad(days);
      hoursEl.textContent = pad(hours);
      minsEl.textContent = pad(mins);
      secsEl.textContent = pad(secs);
      cityEl.textContent = next.el.querySelector('.tour-city')?.textContent || '';
    }

    if (shows.length === 0) {
      countdownEl.remove();
      return;
    }

    tick();
    timer = setInterval(tick, 1000);
  })();

  // ---- "Days remaining" badge on every tour row ----
  (function initTourRemaining() {
    const items = Array.from(document.querySelectorAll('.tour-item[data-date]'))
      .map((el) => ({ el, badge: el.querySelector('[data-remaining]'), date: new Date(el.dataset.date) }))
      .filter((item) => item.badge && !Number.isNaN(item.date.getTime()));

    if (items.length === 0) return;

    function pluralDays(n) {
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod10 === 1 && mod100 !== 11) return 'день';
      if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'дня';
      return 'дней';
    }

    function startOfDay(date) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function update() {
      const today = startOfDay(new Date());
      items.forEach(({ badge, date }) => {
        const diffDays = Math.round((startOfDay(date) - today) / 86400000);
        let text;
        let isSoon = false;

        if (diffDays < 0) {
          text = 'Прошло';
        } else if (diffDays === 0) {
          text = 'Сегодня';
          isSoon = true;
        } else if (diffDays === 1) {
          text = 'Завтра';
          isSoon = true;
        } else {
          text = `Через ${diffDays} ${pluralDays(diffDays)}`;
          isSoon = diffDays <= 7;
        }

        badge.textContent = text;
        badge.classList.toggle('is-soon', isSoon);
      });
    }

    update();
    setInterval(update, 60000);
  })();

  // ---- Subtle parallax drift on the background tiles (desktop pointer
  // only -- mobile browsers' rubber-band overscroll and dynamic address
  // bar make a scrollY-driven transform jump around unpredictably there). ----
  (function initParallax() {
    const bgTiles = document.querySelector('.bg-tiles');
    if (
      !bgTiles ||
      !window.matchMedia('(pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let ticking = false;
    function update() {
      bgTiles.style.transform = `translateY(${window.scrollY * -0.12}px)`;
      ticking = false;
    }
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  })();

  // ---- Fade-in on scroll ----
  const fadeEls = document.querySelectorAll('.fade-in');

  // Stagger siblings that reveal together (e.g. the 11 tour rows) instead of
  // popping in as one flat block; capped so a long list doesn't drag out.
  fadeEls.forEach((el) => {
    const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains('fade-in'));
    const index = Math.min(siblings.indexOf(el), 6);
    el.style.setProperty('--reveal-i', index);
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    fadeEls.forEach((el) => observer.observe(el));
  } else {
    fadeEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ---- Magnetic CTA buttons (desktop pointer only, respects reduced-motion) ----
  const canMagnetize =
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (canMagnetize) {
    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      const strength = parseFloat(btn.dataset.magnetic) || 0.3;
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * strength;
        const y = (e.clientY - rect.top - rect.height / 2) * strength;
        btn.style.transition = 'transform 0.1s ease-out';
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  // ---- Tilt-on-hover for the booking card (desktop pointer only) ----
  if (canMagnetize) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transition = 'transform 0.1s ease-out';
        card.style.transform = `perspective(800px) rotateX(${py * -6}deg) rotateY(${px * 6}deg) scale(1.015)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
      });
    });
  }

  // ---- Ambient cursor glow (desktop pointer only) ----
  if (canMagnetize) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);

    let glowRaf = null;
    let glowX = 0;
    let glowY = 0;

    window.addEventListener(
      'mousemove',
      (e) => {
        glow.classList.add('is-active');
        glowX = e.clientX;
        glowY = e.clientY;
        if (glowRaf) return;
        glowRaf = requestAnimationFrame(() => {
          glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
          glowRaf = null;
        });
      },
      { passive: true }
    );

    document.addEventListener('mouseleave', () => glow.classList.remove('is-active'));
  }

  // ---- Clips player: single large clip, arrows page between videos ----
  const clips = [
    { id: '9jimi5Efc0Y', label: 'клип 1' },
    { id: 'zoIS-RphZyA', label: 'клип 2' },
    { id: '2tUWM5gsl04', label: 'клип 3' },
  ];
  const clipStage = document.getElementById('clip-stage');
  const clipCounter = document.getElementById('clip-counter');
  let clipIndex = 0;

  function playClip(id) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
    iframe.title = 'Клип Абзала Утешова';
    iframe.loading = 'lazy';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    clipStage.replaceChildren(iframe);
  }

  function renderClip(index) {
    clipIndex = (index + clips.length) % clips.length;
    const clip = clips[clipIndex];

    const btn = document.createElement('button');
    btn.className = 'clip-thumb';
    btn.type = 'button';
    btn.setAttribute('aria-label', `Смотреть ${clip.label}`);

    const img = document.createElement('img');
    img.src = `https://i.ytimg.com/vi/${clip.id}/hqdefault.jpg`;
    img.alt = '';
    img.width = 480;
    img.height = 360;
    img.loading = 'lazy';

    const play = document.createElement('span');
    play.className = 'clip-play';
    play.setAttribute('aria-hidden', 'true');
    play.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';

    btn.append(img, play);
    btn.addEventListener('click', () => playClip(clip.id));
    clipStage.replaceChildren(btn);

    if (clipCounter) clipCounter.textContent = `${clipIndex + 1} / ${clips.length}`;
  }

  if (clipStage) {
    renderClip(0);
    document.querySelectorAll('[data-clip-dir]').forEach((arrow) => {
      arrow.addEventListener('click', () => renderClip(clipIndex + Number(arrow.dataset.clipDir)));
    });
  }

  // ---- FAQ accordion: pure-CSS grid-rows reveal (see .faq-panel in style.css) ----
  document.querySelectorAll('.faq-item').forEach((item) => {
    const btn = item.querySelector('.faq-summary');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });

  // ---- Analytics: track "Buy tickets" clicks ----
  // Подключите реальные пиксели в index.html (перед </head>):
  //   Facebook Pixel, TikTok Pixel, Google Analytics / Яндекс.Метрику.
  // Ниже — безопасные обёртки: событие отправится только если соответствующий
  // счётчик подключён на странице.
  function trackTicketClick(event) {
    const label = event.currentTarget.closest('.tour-item')
      ? event.currentTarget.closest('.tour-item').querySelector('.tour-city')?.textContent
      : 'hero';

    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', { content_name: 'buy_tickets', city: label });
    }
    if (typeof window.ttq !== 'undefined' && typeof window.ttq.track === 'function') {
      window.ttq.track('ClickButton', { content_name: 'buy_tickets', city: label });
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'buy_tickets_click', { city: label });
    }
    if (typeof window.ym === 'function' && window.YM_COUNTER_ID) {
      window.ym(window.YM_COUNTER_ID, 'reachGoal', 'buy_tickets_click');
    }
  }

  document.querySelectorAll('[data-track="buy-tickets"]').forEach((el) => {
    el.addEventListener('click', trackTicketClick);
  });
})();
