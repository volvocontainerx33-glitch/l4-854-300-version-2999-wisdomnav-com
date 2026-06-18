const SELECTOR = {
  navToggle: '[data-nav-toggle]',
  mobileNav: '[data-mobile-nav]',
  heroSlider: '[data-hero-slider]',
  heroSlide: '[data-hero-slide]',
  heroDot: '[data-hero-dot]',
  filterPanel: '[data-filter-panel]',
  filterInput: '[data-filter-input]',
  filterYear: '[data-filter-year]',
  filterType: '[data-filter-type]',
  filterCategory: '[data-filter-category]',
  filterCount: '[data-filter-count]',
  card: '[data-card]',
  emptyState: '[data-empty-state]',
  player: '[data-player]',
  playerStart: '[data-player-start]',
  playerStatus: '[data-player-status]',
  globalSearch: '[data-global-search]',
  globalResults: '[data-global-results]',
  globalEmpty: '[data-global-empty]',
  fallbackImage: '[data-fallback-image]'
};

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function initMobileNav() {
  const toggle = document.querySelector(SELECTOR.navToggle);
  const nav = document.querySelector(SELECTOR.mobileNav);
  if (!toggle || !nav) {
    return;
  }
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

function initImageFallbacks() {
  document.querySelectorAll(SELECTOR.fallbackImage).forEach((image) => {
    image.addEventListener('error', () => {
      const holder = image.closest('[data-poster]') || image.parentElement;
      if (holder) {
        holder.classList.add('poster-missing');
      }
      image.remove();
    }, { once: true });
  });
}

function initHeroSliders() {
  document.querySelectorAll(SELECTOR.heroSlider).forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll(SELECTOR.heroSlide));
    const dots = Array.from(slider.querySelectorAll(SELECTOR.heroDot));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    if (slides.length <= 1) {
      return;
    }
    let current = 0;
    let timer = null;

    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => show(current + 1), 5000);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
      }
    };

    prev?.addEventListener('click', () => {
      show(current - 1);
      start();
    });
    next?.addEventListener('click', () => {
      show(current + 1);
      start();
    });
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        show(index);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  });
}

function yearMatches(cardYear, selected) {
  if (!selected) {
    return true;
  }
  const year = Number(cardYear);
  const selectedYear = Number(selected);
  if (!Number.isFinite(year)) {
    return false;
  }
  if (selectedYear >= 1990 && selectedYear <= 2010) {
    return year >= selectedYear && year <= selectedYear + 9;
  }
  return year === selectedYear;
}

function initFilters() {
  document.querySelectorAll(SELECTOR.filterPanel).forEach((panel) => {
    const scope = panel.closest('section') || document;
    const input = panel.querySelector(SELECTOR.filterInput);
    const yearSelect = panel.querySelector(SELECTOR.filterYear);
    const typeSelect = panel.querySelector(SELECTOR.filterType);
    const categorySelect = panel.querySelector(SELECTOR.filterCategory);
    const count = panel.querySelector(SELECTOR.filterCount);
    const cards = Array.from(scope.querySelectorAll(SELECTOR.card));
    const empty = scope.querySelector(SELECTOR.emptyState);

    const apply = () => {
      const query = (input?.value || '').trim().toLowerCase();
      const year = yearSelect?.value || '';
      const type = typeSelect?.value || '';
      const category = categorySelect?.value || '';
      let visible = 0;

      cards.forEach((card) => {
        const text = (card.dataset.searchText || '').toLowerCase();
        const matchesQuery = !query || text.includes(query);
        const matchesYear = yearMatches(card.dataset.year || '', year);
        const matchesType = !type || (card.dataset.type || '').includes(type) || text.includes(type.toLowerCase());
        const matchesCategory = !category || text.includes(category.toLowerCase());
        const shouldShow = matchesQuery && matchesYear && matchesType && matchesCategory;
        card.hidden = !shouldShow;
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = `匹配 ${visible} 部`;
      }
      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    [input, yearSelect, typeSelect, categorySelect].forEach((control) => {
      control?.addEventListener('input', apply);
      control?.addEventListener('change', apply);
    });
    apply();
  });
}

async function loadHlsModule() {
  const module = await import('./hls.js');
  return module.H;
}

function initPlayers() {
  document.querySelectorAll(SELECTOR.player).forEach((shell) => {
    const video = shell.querySelector('video');
    const start = shell.querySelector(SELECTOR.playerStart);
    const status = shell.querySelector(SELECTOR.playerStatus);
    const source = shell.dataset.src;
    let hasLoaded = false;

    const setStatus = (message) => {
      if (status) {
        status.textContent = message;
      }
    };

    const boot = async () => {
      if (!video || !source || hasLoaded) {
        return;
      }
      hasLoaded = true;
      setStatus('正在加载播放源…');
      start?.classList.add('is-hidden');

      try {
        if (source.includes('.m3u8')) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else {
            const Hls = await loadHlsModule();
            if (Hls && Hls.isSupported()) {
              const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
              });
              hls.loadSource(source);
              hls.attachMedia(video);
              hls.on(Hls.Events.ERROR, (_, data) => {
                if (data?.fatal) {
                  setStatus('播放源暂时无法加载');
                }
              });
            } else {
              video.src = source;
            }
          }
        } else {
          video.src = source;
        }
        await video.play();
        setStatus('正在播放');
      } catch (error) {
        start?.classList.remove('is-hidden');
        hasLoaded = false;
        setStatus('点击后可重新尝试播放');
      }
    };

    start?.addEventListener('click', boot);
    video?.addEventListener('play', () => {
      start?.classList.add('is-hidden');
      setStatus('正在播放');
    });
    video?.addEventListener('pause', () => setStatus('已暂停'));
  });
}

function renderSearchCard(item) {
  const tags = (item.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
  return `
    <a class="movie-card" href="${escapeHtml(item.url)}">
      <div class="poster poster-portrait" data-poster data-title="${escapeHtml(item.title)}">
        <img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async" data-fallback-image>
        <span class="poster-badge">${escapeHtml(item.type)}</span>
      </div>
      <div class="movie-card-body">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.one_line)}</p>
        <div class="movie-meta">
          <span>${escapeHtml(item.region)}</span>
          <span>${escapeHtml(item.year)}</span>
          <span>${escapeHtml(item.category)}</span>
        </div>
        <div class="tag-row">${tags}</div>
      </div>
    </a>
  `;
}

function initGlobalSearch() {
  const root = document.querySelector(SELECTOR.globalSearch);
  if (!root || !window.MOVIE_SEARCH_INDEX) {
    return;
  }

  const input = root.querySelector('[data-global-search-input]');
  const typeSelect = root.querySelector('[data-global-type]');
  const categorySelect = root.querySelector('[data-global-category]');
  const results = root.querySelector(SELECTOR.globalResults);
  const empty = root.querySelector(SELECTOR.globalEmpty);
  const count = root.querySelector('[data-global-count]');
  const params = new URLSearchParams(window.location.search);
  const presetKeyword = params.get('keyword');

  if (presetKeyword && input) {
    input.value = presetKeyword;
  }

  const apply = () => {
    const query = (input?.value || '').trim().toLowerCase();
    const type = typeSelect?.value || '';
    const category = categorySelect?.value || '';
    const data = window.MOVIE_SEARCH_INDEX || [];
    const matches = data.filter((item) => {
      const haystack = `${item.title} ${item.region} ${item.type} ${item.year} ${item.genre} ${item.category} ${(item.tags || []).join(' ')}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesType = !type || item.type.includes(type);
      const matchesCategory = !category || item.category === category;
      return matchesQuery && matchesType && matchesCategory;
    });
    const limited = matches.slice(0, 80);
    if (results) {
      results.innerHTML = limited.map(renderSearchCard).join('');
      initImageFallbacks();
    }
    if (count) {
      count.textContent = `匹配 ${matches.length} 部`;
    }
    if (empty) {
      empty.hidden = matches.length !== 0;
    }
  };

  [input, typeSelect, categorySelect].forEach((control) => {
    control?.addEventListener('input', apply);
    control?.addEventListener('change', apply);
  });
  apply();
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initImageFallbacks();
  initHeroSliders();
  initFilters();
  initPlayers();
  initGlobalSearch();
});
