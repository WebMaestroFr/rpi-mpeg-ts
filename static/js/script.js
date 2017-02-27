var url = "ws://" + document.location.hostname;

// MPEG Stream (https://github.com/phoboslab/jsmpeg)
var mpegCanvas = document.getElementById("mpeg-stream");
var mpegPlayer = new JSMpeg.Player(url + ":8084", {
    canvas: mpegCanvas,
    loop: false,
    autoplay: true,
    audio: false,
    pauseWhenHidden: false,
    progressive: false
});