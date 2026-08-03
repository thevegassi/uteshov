(() => {
  'use strict';

  // ---- Header background on scroll ----
  const header = document.getElementById('site-header');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

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

  // ---- Fade-in on scroll ----
  const fadeEls = document.querySelectorAll('.fade-in');
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
