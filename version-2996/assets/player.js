document.addEventListener("DOMContentLoaded", function () {
  var video = document.getElementById("movie-player");
  var cover = document.querySelector(".play-cover");

  if (!video) {
    return;
  }

  var stream = video.getAttribute("data-stream");
  var started = false;
  var instance = null;

  function begin() {
    if (!stream) {
      return;
    }

    if (cover) {
      cover.classList.add("hidden");
    }

    if (!started) {
      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        instance.loadSource(stream);
        instance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    var playResult = video.play();

    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", begin);
  }

  video.addEventListener("click", function () {
    if (!started || video.paused) {
      begin();
    }
  });

  window.addEventListener("pagehide", function () {
    if (instance) {
      instance.destroy();
      instance = null;
    }
  });
});
