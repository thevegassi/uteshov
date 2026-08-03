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
      const strength = 0.3;
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

  // ---- Hero depth: subtle mouse-tracking parallax (desktop only) ----
  const hero = document.getElementById('hero');
  const heroPhoto = document.querySelector('.hero-photo');
  const heroGlow = document.querySelector('.hero-media-glow');
  if (canMagnetize && hero && heroPhoto && heroGlow) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroPhoto.style.setProperty('--tilt-x', `${x * -16}px`);
      heroPhoto.style.setProperty('--tilt-y', `${y * -10}px`);
      heroGlow.style.setProperty('--tilt-x', `${x * -6}px`);
      heroGlow.style.setProperty('--tilt-y', `${y * -6}px`);
    });
    hero.addEventListener('mouseleave', () => {
      heroPhoto.style.setProperty('--tilt-x', '0px');
      heroPhoto.style.setProperty('--tilt-y', '0px');
      heroGlow.style.setProperty('--tilt-x', '0px');
      heroGlow.style.setProperty('--tilt-y', '0px');
    });
  }

  // ---- Clips carousel: click-to-play thumbnails + arrow controls ----
  document.querySelectorAll('.clip-thumb').forEach((btn) => {
    btn.addEventListener('click', () => {
      const videoId = btn.dataset.videoId;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      iframe.title = 'Клип Абзала Утешова';
      iframe.loading = 'lazy';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      btn.replaceWith(iframe);
    });
  });

  const clipsCarousel = document.getElementById('clips-carousel');
  if (clipsCarousel) {
    document.querySelectorAll('[data-carousel-dir]').forEach((arrow) => {
      arrow.addEventListener('click', () => {
        const dir = Number(arrow.dataset.carouselDir);
        const slide = clipsCarousel.querySelector('.clip-slide');
        const step = slide ? slide.getBoundingClientRect().width + 16 : 300;
        clipsCarousel.scrollBy({ left: dir * step, behavior: 'smooth' });
      });
    });
  }

  // ---- Animated FAQ accordion: smooth height instead of the native <details> snap ----
  if (typeof Element.prototype.animate === 'function') {
    document.querySelectorAll('.faq-item').forEach((details) => {
      const summary = details.querySelector('summary');
      const content = details.querySelector('p');
      if (!summary || !content) return;

      let animation = null;

      summary.addEventListener('click', (e) => {
        e.preventDefault();
        details.style.overflow = 'hidden';
        if (details.open) {
          details.classList.remove('is-open');
          collapse();
        } else {
          details.classList.add('is-open');
          expand();
        }
      });

      function run(startHeight, endHeight, openWhenDone) {
        if (animation) animation.cancel();
        animation = details.animate(
          { height: [`${startHeight}px`, `${endHeight}px`] },
          { duration: 280, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
        );
        animation.onfinish = () => {
          details.open = openWhenDone;
          details.style.height = '';
          details.style.overflow = '';
          animation = null;
        };
      }

      function expand() {
        const startHeight = details.offsetHeight;
        details.open = true;
        const margin = parseFloat(getComputedStyle(content).marginTop) || 0;
        const endHeight = summary.offsetHeight + content.offsetHeight + margin;
        run(startHeight, endHeight, true);
      }

      function collapse() {
        const startHeight = details.offsetHeight;
        const endHeight = summary.offsetHeight;
        run(startHeight, endHeight, false);
      }
    });
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
