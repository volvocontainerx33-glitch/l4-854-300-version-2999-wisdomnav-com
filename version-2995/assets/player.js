function initMoviePlayer(source) {
    var video = document.getElementById("movie-player");
    var cover = document.querySelector("[data-player-cover]");
    var hls = null;
    var loaded = false;

    if (!video || !source) {
        return;
    }

    function loadSource() {
        if (loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }

        video.src = source;
    }

    function playVideo() {
        loadSource();
        video.controls = true;

        if (cover) {
            cover.classList.add("is-hidden");
        }

        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                video.controls = true;
            });
        }
    }

    if (cover) {
        cover.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
        if (!loaded || video.paused) {
            playVideo();
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
