document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            toggle.classList.toggle("active");
            panel.classList.toggle("open");
        });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var previous = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var active = 0;

        function showSlide(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("active", itemIndex === active);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("active", itemIndex === active);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                showSlide(active - 1);
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(active + 1);
            });
        }

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(active + 1);
            }, 6500);
        }
    }

    var filterGroup = document.querySelector("[data-filter-group]");
    var localSearch = document.querySelector("[data-local-search]");
    var cardList = document.querySelector("[data-card-list]");

    if (cardList) {
        var cards = Array.prototype.slice.call(cardList.querySelectorAll(".movie-card"));
        var selected = "all";

        function normalize(value) {
            return String(value || "").toLowerCase();
        }

        function applyFilters() {
            var keyword = localSearch ? normalize(localSearch.value) : "";
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var typeMatch = selected === "all" || text.indexOf(normalize(selected)) > -1;
                var keywordMatch = !keyword || text.indexOf(keyword) > -1;
                card.classList.toggle("hidden-card", !(typeMatch && keywordMatch));
            });
        }

        if (filterGroup) {
            filterGroup.addEventListener("click", function (event) {
                var button = event.target.closest("[data-filter-value]");
                if (!button) {
                    return;
                }
                selected = button.getAttribute("data-filter-value") || "all";
                Array.prototype.slice.call(filterGroup.querySelectorAll("[data-filter-value]")).forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                applyFilters();
            });
        }

        if (localSearch) {
            localSearch.addEventListener("input", applyFilters);
        }
    }

    var results = document.querySelector("[data-search-results]");
    if (results && window.SEARCH_MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var query = String(params.get("q") || "").trim();
        var searchInput = document.querySelector(".large-search input[name='q']");
        if (searchInput) {
            searchInput.value = query;
        }

        function escapeHtml(value) {
            return String(value || "").replace(/[&<>\"]/g, function (character) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    "\"": "&quot;"
                }[character];
            });
        }

        function renderCard(movie) {
            return [
                "<article class=\"movie-card\">",
                "<a class=\"poster-link\" href=\"" + escapeHtml(movie.href) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
                "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
                "<span class=\"type-badge\">" + escapeHtml(movie.type) + "</span>",
                "</a>",
                "<div class=\"movie-card-body\">",
                "<h3><a href=\"" + escapeHtml(movie.href) + "\">" + escapeHtml(movie.title) + "</a></h3>",
                "<p class=\"movie-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.genre) + "</p>",
                "<p class=\"movie-desc\">" + escapeHtml(movie.oneLine) + "</p>",
                "<div class=\"tag-row\"><span>" + escapeHtml(movie.category) + "</span></div>",
                "</div>",
                "</article>"
            ].join("");
        }

        if (!query) {
            results.innerHTML = "<p class=\"empty-state\">请输入关键词开始搜索。</p>";
        } else {
            var lowerQuery = query.toLowerCase();
            var matches = window.SEARCH_MOVIES.filter(function (movie) {
                var text = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags, movie.category, movie.oneLine].join(" ").toLowerCase();
                return text.indexOf(lowerQuery) > -1;
            }).slice(0, 120);
            results.innerHTML = matches.length ? matches.map(renderCard).join("") : "<p class=\"empty-state\">没有找到匹配影片。</p>";
        }
    }
});
