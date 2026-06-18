function startVideoPlayer(address) {
  var video = document.querySelector('[data-player]');
  var button = document.querySelector('[data-play]');
  if (!video || !address) {
    return;
  }

  var ready = false;
  var hlsInstance = null;

  function attach() {
    if (ready) {
      return;
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = address;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true });
      hlsInstance.loadSource(address);
      hlsInstance.attachMedia(video);
    } else {
      video.src = address;
    }
  }

  function play() {
    attach();
    if (button) {
      button.classList.add('is-hidden');
    }
    video.controls = true;
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
