(function () {
    var body = document.body;
    var navToggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            var expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!expanded));
            mobileNav.hidden = expanded;
            body.classList.toggle('nav-open', !expanded);
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    function startHero() {
        if (heroTimer) {
            clearInterval(heroTimer);
        }
        if (slides.length > 1) {
            heroTimer = setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            startHero();
        });
    });

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
            startHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            startHero();
        });
    }

    startHero();

    var grid = document.querySelector('[data-card-grid]');

    if (grid) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var searchInput = document.querySelector('[data-card-search]');
        var regionSelect = document.querySelector('[data-filter-region]');
        var typeSelect = document.querySelector('[data-filter-type]');
        var yearSelect = document.querySelector('[data-filter-year]');
        var categorySelect = document.querySelector('[data-filter-category]');
        var resultCount = document.querySelector('[data-result-count]');

        function fillSelect(select, key, reverse) {
            if (!select) {
                return;
            }

            var values = cards.map(function (card) {
                return card.getAttribute('data-' + key) || '';
            }).filter(Boolean);
            values = values.filter(function (value, index) {
                return values.indexOf(value) === index;
            }).sort(function (a, b) {
                return reverse ? b.localeCompare(a, 'zh-Hans-CN') : a.localeCompare(b, 'zh-Hans-CN');
            });

            values.forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        fillSelect(regionSelect, 'region', false);
        fillSelect(typeSelect, 'type', false);
        fillSelect(yearSelect, 'year', true);

        var params = new URLSearchParams(window.location.search);
        if (searchInput && params.get('q')) {
            searchInput.value = params.get('q');
        }

        function applyFilters() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var category = categorySelect ? categorySelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var matchesQuery = !query || (card.getAttribute('data-search') || '').toLowerCase().indexOf(query) !== -1;
                var matchesRegion = !region || card.getAttribute('data-region') === region;
                var matchesType = !type || card.getAttribute('data-type') === type;
                var matchesYear = !year || card.getAttribute('data-year') === year;
                var matchesCategory = !category || card.getAttribute('data-category') === category;
                var matched = matchesQuery && matchesRegion && matchesType && matchesYear && matchesCategory;

                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (resultCount) {
                resultCount.textContent = visible + ' 部影片';
            }
        }

        [searchInput, regionSelect, typeSelect, yearSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var stream = video ? video.getAttribute('data-stream') : '';
        var hlsInstance = null;

        function attach() {
            if (!video || !stream || video.getAttribute('data-ready') === 'true') {
                return;
            }

            video.setAttribute('data-ready', 'true');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function play() {
            if (!video) {
                return;
            }

            attach();
            player.classList.add('is-playing');
            video.controls = true;
            var promise = video.play();

            if (promise && promise.catch) {
                promise.catch(function () {
                    player.classList.remove('is-playing');
                    video.controls = true;
                });
            }
        }

        attach();

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (!video.seeking && video.currentTime === 0) {
                    player.classList.remove('is-playing');
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
