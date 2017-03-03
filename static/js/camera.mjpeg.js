// Motion JPEG

var mjpegCanvas = document.getElementById("mjpeg-canvas");
var mjpegContext = mjpegCanvas.getContext("2d");

var mjpegImage = new Image();
mjpegImage.addEventListener("load", function() {
    mjpegContext.clearRect(0, 0, mjpegCanvas.width, mjpegCanvas.height);
    mjpegContext.drawImage(mjpegImage, 0, 0, mjpegImage.width, mjpegImage.height, 0, 0, mjpegCanvas.width, mjpegCanvas.height);
});

document.addEventListener("camera-mjpeg", function(e) {
    mjpegImage.src = "data:image/jpeg;base64," + e.data;
});