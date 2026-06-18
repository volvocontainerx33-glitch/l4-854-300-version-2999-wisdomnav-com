document.addEventListener("DOMContentLoaded", function () {
  var navToggle = document.querySelector("[data-nav-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var prev = document.querySelector("[data-hero-prev]");
  var next = document.querySelector("[data-hero-next]");
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === activeIndex);
    });
  }

  function startHeroTimer() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startHeroTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(activeIndex - 1);
        startHeroTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(activeIndex + 1);
        startHeroTimer();
      });
    }

    showSlide(0);
    startHeroTimer();
  }

  var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));

  inputs.forEach(function (input) {
    var scopeName = input.getAttribute("data-filter-scope");
    var scope = scopeName ? document.querySelector('[data-filter-group="' + scopeName + '"]') : document;
    var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll("[data-search]")) : [];

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        card.classList.toggle("is-hidden", Boolean(query) && text.indexOf(query) === -1);
      });
    });
  });
});
