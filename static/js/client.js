var canvas = document.getElementById("camera-stream");
var url = "ws://" + document.location.hostname;
var player = new JSMpeg.Player(url + ":8082", {
    canvas: canvas,
    loop: false,
    autoplay: true,
    audio: false,
    poster: "http://placehold.it/640x480/222222/ffffff?text=Waiting+for+camera+...",
    pauseWhenHidden: false,
    progressive: false
});