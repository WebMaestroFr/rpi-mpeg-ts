var url = "ws://" + document.location.hostname;

// MPEG Stream (https://github.com/phoboslab/jsmpeg)
var mpegCanvas = document.getElementById("mpeg-canvas");
var mpegPlayer = new JSMpeg.Player(url + ":8084", {
    canvas: mpegCanvas,
    loop: false,
    autoplay: true,
    audio: false,
    pauseWhenHidden: false,
    progressive: false
});

// Face Detections
var detectionCanvas = document.getElementById("detection-canvas");
var detectionContext = detectionCanvas.getContext('2d');
detectionContext.lineWidth = 4;

// Application Messages
var jsonSocket = new WebSocket(url + ":8082");
jsonSocket.addEventListener('message', function(event) {
    var message = JSON.parse(event.data);
    console.log(message);
    switch (message.type) {
        case "detection":
            detectionContext.clearRect(0, 0, detectionCanvas.width, detectionCanvas.height);
            message
                .data
                .forEach(function(face) {
                    var w = face.width / 2;
                    var h = face.height / 2;
                    detectionContext.beginPath();
                    detectionContext.arc(face.x + w, face.y + h, Math.max(w, h), 0, Math.PI * 2);
                    detectionContext.stroke();
                });
            break;
    }
});