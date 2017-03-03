// MPEG Transport Stream
var mpegtsCanvas = document.getElementById("mpegts-canvas");
var mpegtsPlayer = new JSMpeg.Player(app.url + ":8084", {
    canvas: mpegtsCanvas,
    loop: false,
    autoplay: true,
    audio: false,
    pauseWhenHidden: false,
    progressive: false
});