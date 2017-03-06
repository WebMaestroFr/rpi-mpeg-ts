// Path
var path = require("path");

// Application
var express = require("express");
var app = express();

// Static Files
app.use("/", express.static(path.join(__dirname, "static")));

// Index
app.get("/", function(req, res) {
    "use strict";
    var index = path.join(__dirname, "index.html");
    res.sendFile(index);
});

// WebSockets
var WebSocket = require("ws");

// Application Messages
var appSocket = new WebSocket.Server({perMessageDeflate: false, port: 8082});
appSocket.broadcast = function(type, data) {
    var message = JSON.stringify({type: type, data: data});
    appSocket
        .clients
        .forEach(function(client) {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(message);
                } catch (err) {
                    console.error("Broadcast Message", err);
                }
            }
        });
};

// Camera
var Camera = require("./camera");
var camera = new Camera({hflip: true, vflip: true, saturation: -100, drc: "high"});

// Computer Vision
var Vision = require("./vision");

// Face Detection
var processFrame = function(data) {
    var frame = data.toString("base64");
    appSocket.broadcast("camera-mjpeg", frame);
    Vision.read(data, function(matrix) {
        Vision
            .detect(matrix, "face", {
                scale: 1.05,
                neighbors: 8,
                min: [48, 48]
            }, function(faces) {
                appSocket.broadcast("cv-detect-object", faces);
                if (faces.length) {
                    var d = new Date();
                    matrix.save("./static/img/" + d.toISOString() + ".jpg");
                }
            });
    });
};
var mjpegStream = camera.stream("mjpeg", processFrame);

app.get("/mjpeg", function(req, res) {
    "use strict";
    var index = path.join(__dirname, "camera.mjpeg.html");
    res.sendFile(index);
});

// MPEG Transport Stream
var mpegtsSocket = new WebSocket.Server({port: 8084});
var mpegtsStream = camera.stream("mpegts", function(data) {
    mpegtsSocket
        .clients
        .forEach(function(client) {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(data);
                } catch (err) {
                    console.error("Broadcast Message", err);
                }
            }
        });
});
mpegtsSocket.on("connection", function(client) {
    if (1 === mpegtsSocket.clients.size) {
        mpegtsStream.start();
    }
    client
        .on("close", function() {
            if (0 === mpegtsSocket.clients.size) {
                mpegtsStream.stop();
            }
        });
});

app.get("/mpegts", function(req, res) {
    "use strict";
    var index = path.join(__dirname, "camera.mpegts.html");
    res.sendFile(index);
});

// HTTP Server
var server = require("http").Server(app);
server.listen({
    "port": 8080
}, function() {
    mjpegStream.start();
});