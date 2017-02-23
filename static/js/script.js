var url = "ws://" + document.location.hostname;

// MPEG Stream
var mpegCanvas = document.getElementById("mpeg-stream");
var mpegPlayer = new JSMpeg.Player(url + ":8084", {
    canvas: mpegCanvas,
    loop: false,
    autoplay: true,
    audio: false,
    pauseWhenHidden: false,
    progressive: false
});

// JPEG Stream
var jpegCanvas = document.getElementById("jpeg-stream");
var jpegContext = jpegCanvas.getContext('2d');
jpegContext.globalAlpha = 0.33;

var jpeg = new Image();
jpeg.addEventListener('load', function() {
    jpegContext.clearRect(0, 0, jpegCanvas.width, jpegCanvas.height);
    jpegContext.drawImage(jpeg, 0, 0, jpeg.width, jpeg.height, 0, 0, jpegCanvas.width, jpegCanvas.height);
});

// Face Detection Stream
var detectionCanvas = document.getElementById("detection");
var detectionContext = detectionCanvas.getContext('2d');
detectionContext.lineWidth = 4;

var detectionSocket = new WebSocket(url + ":8082");
detectionSocket.addEventListener('message', function(event) {
    var data = JSON.parse(event.data);
    jpeg.src = 'data:image/jpeg;base64,' + data.buffer;
    detectionContext.clearRect(0, 0, detectionCanvas.width, detectionCanvas.height);
    data
        .faces
        .forEach(function(face) {
            detectionContext.strokeRect(face.x, face.y, face.width, face.height);
        });
    console.log(data.faces);
});