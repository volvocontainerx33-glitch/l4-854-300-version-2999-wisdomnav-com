(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('is-visible', window.scrollY > 460);
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var localInput = document.querySelector('[data-local-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]'));
  var currentFilter = '全部';
  function applyFilter() {
    var keyword = localInput ? localInput.value.trim().toLowerCase() : '';
    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchesButton = currentFilter === '全部' || haystack.indexOf(currentFilter.toLowerCase()) !== -1;
      card.classList.toggle('is-hidden', !(matchesKeyword && matchesButton));
    });
  }
  if (localInput) {
    localInput.addEventListener('input', applyFilter);
  }
  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      currentFilter = button.getAttribute('data-filter-button') || '全部';
      buttons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilter();
    });
  });
})();
