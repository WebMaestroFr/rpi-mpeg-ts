var canvas = document.getElementById("camera-stream");
var url = "ws://" + document.location.hostname;
var player = new JSMpeg.Player(url + ":8082", {
    canvas: canvas,
    loop: false,
    autoplay: true,
    audio: false,
    pauseWhenHidden: false,
    progressive: false
});