(function () {
    var mobileToggle = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function nextSlide() {
            showSlide(active + 1);
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(nextSlide, 5000);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(active - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                nextSlide();
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    var searchInput = document.getElementById('site-search');
    var searchResults = document.getElementById('search-results');

    if (searchInput && searchResults && Array.isArray(window.MOVIE_SEARCH_DATA)) {
        var data = window.MOVIE_SEARCH_DATA;
        var prefix = getPrefix();

        searchInput.addEventListener('input', function () {
            var keyword = searchInput.value.trim().toLowerCase();

            if (!keyword) {
                searchResults.innerHTML = '';
                searchResults.classList.remove('is-open');
                return;
            }

            var results = data.filter(function (item) {
                var text = [
                    item.title,
                    item.region,
                    item.type,
                    item.year,
                    item.genre,
                    item.category,
                    item.oneLine
                ].join(' ').toLowerCase();

                return text.indexOf(keyword) !== -1;
            }).slice(0, 12);

            searchResults.innerHTML = results.map(function (item) {
                return [
                    '<a class="search-result-item" href="' + prefix + item.url + '">',
                    '<img src="' + prefix + item.cover + '" alt="' + escapeHtml(item.title) + '">',
                    '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.type + ' · ' + item.region) + '</span></span>',
                    '</a>'
                ].join('');
            }).join('');

            searchResults.classList.toggle('is-open', results.length > 0);
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
        var selectedYear = 'all';
        var selectedType = 'all';

        function applyFilters() {
            cards.forEach(function (card) {
                var matchesYear = selectedYear === 'all' || card.getAttribute('data-year') === selectedYear;
                var matchesType = selectedType === 'all' || card.getAttribute('data-type') === selectedType;
                card.style.display = matchesYear && matchesType ? '' : 'none';
            });
        }

        Array.prototype.slice.call(scope.querySelectorAll('[data-filter-year]')).forEach(function (button) {
            button.addEventListener('click', function () {
                selectedYear = button.getAttribute('data-filter-year') || 'all';
                Array.prototype.slice.call(scope.querySelectorAll('[data-filter-year]')).forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilters();
            });
        });

        Array.prototype.slice.call(scope.querySelectorAll('[data-filter-type]')).forEach(function (button) {
            button.addEventListener('click', function () {
                selectedType = button.getAttribute('data-filter-type') || 'all';
                Array.prototype.slice.call(scope.querySelectorAll('[data-filter-type]')).forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilters();
            });
        });
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
        var video = player.querySelector('video');
        var playButton = player.querySelector('[data-player-play]');
        var loading = player.querySelector('[data-player-loading]');
        var errorBox = player.querySelector('[data-player-error]');
        var hls = null;
        var initialized = false;

        function hideLoading() {
            if (loading) {
                loading.classList.add('is-hidden');
            }
        }

        function showError(message) {
            hideLoading();
            if (errorBox) {
                errorBox.textContent = message;
            }
        }

        function initializePlayer() {
            if (!video || initialized) {
                return;
            }

            initialized = true;
            var src = video.getAttribute('data-src');

            if (!src) {
                showError('视频加载失败');
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showError('视频加载失败');
                    }
                });

                hls.on(window.Hls.Events.MANIFEST_PARSED, hideLoading);
                hls.loadSource(src);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                video.addEventListener('loadedmetadata', hideLoading, { once: true });
            } else {
                video.src = src;
                hideLoading();
            }
        }

        function playVideo() {
            initializePlayer();

            if (playButton) {
                playButton.classList.add('is-hidden');
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (playButton) {
                        playButton.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (playButton) {
            playButton.addEventListener('click', playVideo);
        }

        if (video) {
            initializePlayer();
            video.controls = true;
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });
            video.addEventListener('play', function () {
                if (playButton) {
                    playButton.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (playButton && video.currentTime === 0) {
                    playButton.classList.remove('is-hidden');
                }
            });
            video.addEventListener('error', function () {
                showError('视频加载失败');
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    });

    function getPrefix() {
        var path = window.location.pathname;
        if (path.indexOf('/detail/') !== -1 || path.indexOf('/category/') !== -1) {
            return '../';
        }
        return './';
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
})();
