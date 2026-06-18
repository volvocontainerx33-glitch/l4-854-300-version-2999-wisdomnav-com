(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMenu() {
    var button = $('[data-menu-button]');
    var panel = $('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('.hero-slide', hero);
    var dots = $all('.hero-dot', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
        slide.setAttribute('aria-hidden', slideIndex === index ? 'false' : 'true');
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
        dot.setAttribute('aria-label', '切换到第 ' + (dotIndex + 1) + ' 屏');
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    show(0);
    start();
  }

  function setupCardFilters() {
    var input = $('[data-card-search]');
    var yearSelect = $('[data-card-year]');
    var regionSelect = $('[data-card-region]');
    var cards = $all('[data-movie-card]');

    if (!cards.length || (!input && !yearSelect && !regionSelect)) {
      return;
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var region = normalize(regionSelect ? regionSelect.value : '');

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
        var matchRegion = !region || normalize(card.getAttribute('data-region')) === region;
        card.classList.toggle('hidden-card', !(matchKeyword && matchYear && matchRegion));
      });
    }

    [input, yearSelect, regionSelect].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });

    apply();
  }

  function setupSearchPage() {
    var results = $('#search-results');
    if (!results || !window.searchMovies) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var input = $('#search-page-input');
    var note = $('#search-results-note');
    if (input) {
      input.value = query;
    }

    function render(value) {
      var keyword = normalize(value);
      var source = window.searchMovies;
      var matched = keyword
        ? source.filter(function (movie) {
            return normalize(movie.title + ' ' + movie.year + ' ' + movie.region + ' ' + movie.category + ' ' + movie.tags + ' ' + movie.oneLine).indexOf(keyword) !== -1;
          })
        : source.slice(0, 72);

      results.innerHTML = matched.slice(0, 240).map(function (movie) {
        return [
          '<article class="movie-card" data-movie-card data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-region="' + escapeHtml(movie.region) + '" data-tags="' + escapeHtml(movie.tags) + '">',
          '  <a class="card-cover" href="./' + escapeHtml(movie.file) + '">',
          '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '    <span class="card-year">' + escapeHtml(movie.year) + '</span>',
          '    <span class="card-glow"></span>',
          '  </a>',
          '  <div class="card-body">',
          '    <div class="card-meta"><a href="./' + escapeHtml(movie.categoryFile) + '">' + escapeHtml(movie.category) + '</a><span>' + escapeHtml(movie.region) + '</span></div>',
          '    <h2><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h2>',
          '    <p>' + escapeHtml(movie.oneLine) + '</p>',
          '    <div class="tag-row">' + movie.tags.split(' ').slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');

      if (note) {
        note.textContent = keyword ? '已为你整理相关影片' : '推荐浏览这些影片';
      }
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
    render(query);
  }

  window.initVideoPlayer = function (source) {
    var video = $('[data-video-player]');
    var overlay = $('[data-player-start]');
    var status = $('[data-player-status]');
    var attached = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function setStatus(message) {
      if (!status) {
        return;
      }
      if (message) {
        status.textContent = message;
        status.hidden = false;
      } else {
        status.textContent = '';
        status.hidden = true;
      }
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      video.setAttribute('controls', 'controls');
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('视频暂时无法加载');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        setStatus('视频暂时无法加载');
      }
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add('hidden');
      }
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {
          setStatus('点击播放器继续观看');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (!attached || video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      setStatus('');
      if (overlay) {
        overlay.classList.add('hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupCardFilters();
    setupSearchPage();
  });
})();
