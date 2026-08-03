# Abzal Uteshov — Landing Page

Официальный одностраничный сайт артиста Абзала Утешова. Верстка на чистом HTML/CSS/JS, без сборки и зависимостей — открывается прямо из `index.html` или деплоится на любой статический хостинг (GitHub Pages, Netlify, Vercel).

## Структура проекта

```
index.html            — вся разметка страницы (Hero, Тур, Музыка, FAQ, Контакты)
assets/css/style.css  — стили, тёмная тема, mobile-first
assets/js/main.js     — мобильное меню, fade-in анимации, шапка при скролле, аналитика
assets/img/           — изображения (добавьте сюда фото артиста)
```

## Как запустить локально

Просто откройте `index.html` в браузере, либо поднимите локальный сервер:

```bash
python3 -m http.server 8000
# затем откройте http://localhost:8000
```

## Что нужно доделать перед запуском

1. **Фото/видео артиста** — сейчас в Hero-секции градиентная заглушка
   (`.hero-media-placeholder` в `assets/css/style.css`). Добавьте фото в
   `assets/img/hero.jpg` и замените заглушку на
   `background: url('../img/hero.jpg') center/cover no-repeat;`,
   либо подключите `<video>` вместо `<div class="hero-media-placeholder">`
   в `index.html`.
2. **График тура** — блок `#tour` в `index.html` уже заполнен реальными
   датами (Қызылорда — Алматы, 5–26 сентября) со ссылками на 2GIS и
   билетного оператора sxodim.com. Алматы (26 сентября) — в статусе
   «Скоро» (билеты ещё не в продаже). Чтобы добавить новый город —
   скопируйте `<li class="tour-item fade-in">…</li>`. Для статуса
   «Продано» добавьте класс `is-sold-out` и замените кнопку на
   `<button class="btn btn-disabled tour-btn" disabled>Продано</button>`,
   для «Скоро» — класс `is-coming-soon` и кнопку с текстом «Скоро».
3. **Ссылка на билеты для Алматы** — как только откроются продажи,
   замените disabled-кнопку в последнем `<li>` блока `#tour` на обычную
   ссылку с `data-track="buy-tickets"` (см. остальные города как пример).
4. **Клип и стриминги** — в блоке `#music` замените `src` iframe на реальный
   YouTube-клип и ссылки Spotify / Apple Music / Яндекс Музыка (или общую
   мультиссылку BandLink).
5. **Контакты (Booking)** — в блоке `#booking` укажите реальное имя
   менеджера, телефон и email.
6. **Соцсети** — ссылки на Instagram и TikTok уже проставлены
   (`uteshov.tour`), добавьте актуальные YouTube и Telegram.
7. **Аналитика** — в `<head>` `index.html` есть закомментированные шаблоны
   для Google Analytics, Яндекс.Метрики, Facebook Pixel и TikTok Pixel.
   Вставьте свои ID и раскомментируйте нужные блоки. Клики по кнопке
   «Купить билеты» уже отслеживаются через `assets/js/main.js`
   (`data-track="buy-tickets"`).
8. **Favicon и OG-обложка** — добавьте `assets/img/favicon.png` и
   `assets/img/og-cover.jpg` (уже прописаны в `<head>`).

## Деплой

Статику можно выложить на GitHub Pages (Settings → Pages → Deploy from
branch), Netlify или Vercel — специальная сборка не требуется.
