(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHeroCarousel() {
        var root = document.querySelector("[data-hero]");

        if (!root) {
            return;
        }

        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var countNode = document.querySelector("[data-result-count]");

        if (!panel || !cards.length) {
            return;
        }

        var keyword = panel.querySelector("[data-filter-keyword]");
        var category = panel.querySelector("[data-filter-category]");
        var year = panel.querySelector("[data-filter-year]");
        var region = panel.querySelector("[data-filter-region]");
        var type = panel.querySelector("[data-filter-type]");
        var reset = panel.querySelector("[data-filter-reset]");
        var params = new URLSearchParams(window.location.search);
        var incomingQuery = params.get("q");

        if (incomingQuery && keyword) {
            keyword.value = incomingQuery;
        }

        function cardText(card) {
            return [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-category"),
                card.getAttribute("data-tags"),
                card.textContent
            ].join(" ").toLowerCase();
        }

        function apply() {
            var query = normalize(keyword && keyword.value);
            var selectedCategory = normalize(category && category.value);
            var selectedYear = normalize(year && year.value);
            var selectedRegion = normalize(region && region.value);
            var selectedType = normalize(type && type.value);
            var visible = 0;

            cards.forEach(function (card) {
                var matched = true;
                var content = cardText(card);

                if (query && content.indexOf(query) === -1) {
                    matched = false;
                }

                if (selectedCategory && normalize(card.getAttribute("data-category")) !== selectedCategory) {
                    matched = false;
                }

                if (selectedYear && normalize(card.getAttribute("data-year")) !== selectedYear) {
                    matched = false;
                }

                if (selectedRegion && normalize(card.getAttribute("data-region")) !== selectedRegion) {
                    matched = false;
                }

                if (selectedType && normalize(card.getAttribute("data-type")) !== selectedType) {
                    matched = false;
                }

                card.classList.toggle("is-hidden", !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (countNode) {
                countNode.textContent = String(visible);
            }
        }

        [keyword, category, year, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        if (reset) {
            reset.addEventListener("click", function () {
                [keyword, category, year, region, type].forEach(function (control) {
                    if (control) {
                        control.value = "";
                    }
                });
                apply();
            });
        }

        apply();
    }

    function initImageFallbacks() {
        var images = Array.prototype.slice.call(document.querySelectorAll("img"));

        images.forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
                image.setAttribute("aria-hidden", "true");
            }, { once: true });
        });
    }

    function initPlayer() {
        var video = document.querySelector("video[data-hls]");

        if (!video) {
            return;
        }

        var source = video.getAttribute("data-hls");
        var start = document.querySelector("[data-player-start]");
        var hlsInstance = null;

        function hideStartButton() {
            if (start) {
                start.classList.add("is-hidden");
            }
        }

        function showStartButton() {
            if (start && video.paused) {
                start.classList.remove("is-hidden");
            }
        }

        function attachHls() {
            if (!source) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            }
        }

        attachHls();

        if (start) {
            start.addEventListener("click", function () {
                hideStartButton();
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        showStartButton();
                    });
                }
            });
        }

        video.addEventListener("play", hideStartButton);
        video.addEventListener("pause", showStartButton);
        video.addEventListener("ended", showStartButton);
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        initMobileMenu();
        initHeroCarousel();
        initFilters();
        initImageFallbacks();
        initPlayer();
    });
})();
