(function () {
  var params = new URLSearchParams(window.location.search);
  var q = (params.get('q') || '').trim();
  var input = document.getElementById('searchInput');
  var title = document.getElementById('searchTitle');
  var results = document.getElementById('searchResults');
  if (input) {
    input.value = q;
  }
  if (!results || !Array.isArray(SEARCH_ITEMS)) {
    return;
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function createCard(item) {
    return '<article class="movie-card">' +
      '<a class="poster-link" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + ' 在线观看">' +
      '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '<span class="poster-shade"></span><span class="play-icon">▶</span>' +
      '<span class="year-badge">' + escapeHtml(item.year) + '</span></a>' +
      '<div class="movie-card-body"><h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
      '<p>' + escapeHtml(item.line) + '</p><div class="meta-row"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
      '<div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div></div></article>';
  }

  function runSearch(value) {
    var keyword = String(value || '').trim().toLowerCase();
    var list;
    if (keyword) {
      list = SEARCH_ITEMS.filter(function (item) {
        var haystack = [item.title, item.year, item.region, item.type, item.genre, item.tags, item.line].join(' ').toLowerCase();
        return haystack.indexOf(keyword) !== -1;
      });
    } else {
      list = SEARCH_ITEMS.slice(0, 60);
    }
    if (title) {
      title.textContent = keyword ? '与“' + value + '”相关的内容' : '精选内容';
    }
    results.innerHTML = list.slice(0, 120).map(createCard).join('') || '<p class="empty-result">没有找到相关内容</p>';
  }

  runSearch(q);
})();
