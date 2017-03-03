// Computer Vision
var cvCanvas = document.getElementById("cv-canvas");
var cvContext = cvCanvas.getContext("2d");

document.addEventListener("cv-detect-object", function(e) {
    cvContext.clearRect(0, 0, cvCanvas.width, cvCanvas.height);
    e
        .data
        .forEach(function(object) {
            var w = object.width / 2;
            var h = object.height / 2;
            cvContext.beginPath();
            cvContext.arc(object.x + w, object.y + h, Math.max(w, h), 0, Math.PI * 2);
            cvContext.stroke();
        });
});