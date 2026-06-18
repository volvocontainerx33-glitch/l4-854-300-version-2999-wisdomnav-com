(function () {
  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupFilters() {
    var input = document.querySelector("[data-local-search]");
    var year = document.querySelector("[data-year-filter]");
    var genre = document.querySelector("[data-genre-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!cards.length || (!input && !year && !genre)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input && initial) {
      input.value = initial;
    }

    function apply() {
      var q = normalize(input ? input.value : "");
      var y = normalize(year ? year.value : "");
      var g = normalize(genre ? genre.value : "");
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardGenre = normalize(card.getAttribute("data-genre"));
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (y && cardYear !== y) {
          ok = false;
        }
        if (g && cardGenre.indexOf(g) === -1 && text.indexOf(g) === -1) {
          ok = false;
        }
        card.classList.toggle("hidden-by-filter", !ok);
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
    if (genre) {
      genre.addEventListener("change", apply);
    }
    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play]");
      var source = player.getAttribute("data-src");
      var hlsInstance = null;
      var started = false;
      if (!video || !button || !source) {
        return;
      }

      function load() {
        if (started) {
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        load();
        player.classList.add("is-playing");
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }

      button.addEventListener("click", function (event) {
        event.preventDefault();
        play();
      });

      player.addEventListener("click", function (event) {
        if (event.target === video || event.target.closest("button")) {
          return;
        }
        play();
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupFilters();
    setupPlayers();
  });
})();
