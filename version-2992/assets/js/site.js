(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(active + 1);
      }, 5600);
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
      var input = filterPanel.querySelector('[data-filter-input]');
      var region = filterPanel.querySelector('[data-filter-region]');
      var type = filterPanel.querySelector('[data-filter-type]');
      var year = filterPanel.querySelector('[data-filter-year]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid] [data-card]'));
      var empty = document.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q') || '';

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function norm(value) {
        return String(value || '').trim().toLowerCase();
      }

      function applyFilter() {
        var q = norm(input ? input.value : '');
        var r = region ? region.value : '';
        var t = type ? type.value : '';
        var y = year ? year.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = norm([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre
          ].join(' '));
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (r && card.dataset.region !== r) {
            ok = false;
          }
          if (t && card.dataset.type !== t) {
            ok = false;
          }
          if (y && card.dataset.year !== y) {
            ok = false;
          }
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });

      applyFilter();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (box) {
      var video = box.querySelector('video');
      var overlay = box.querySelector('.player-overlay');
      var src = box.getAttribute('data-video');
      var loaded = false;
      var hls = null;

      function requestPlay() {
        if (!video) {
          return;
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      function loadVideo() {
        if (!video || !src || loaded) {
          return;
        }
        loaded = true;
        video.controls = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.load();
          requestPlay();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            requestPlay();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            }
          });
          requestPlay();
          return;
        }
        video.src = src;
        video.load();
        requestPlay();
      }

      function start() {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        loadVideo();
        requestPlay();
      }

      if (overlay) {
        overlay.addEventListener('click', start);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (!loaded) {
            start();
          }
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
