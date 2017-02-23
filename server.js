// Configuration
var config = require("./config.json");

// Commands
var raspividArgs = [
    "--nopreview",
    "--hflip",
    "--vflip",
    "--inline",
    "--timeout",
    "0",
    "--framerate",
    config.camera.framerate,
    "--width",
    config.camera.size.width,
    "--height",
    config.camera.size.height,
    "--output",
    "-"
];
var avconvInputArgs = [
    "-fflags",
    "nobuffer",
    "-probesize",
    config.camera.probesize,
    "-f",
    "h264",
    "-r",
    config.camera.framerate,
    "-i",
    "-",
    "-an"
];
var mpegArgs = avconvInputArgs.concat([
    "-f",
    "mpegts",
    "-codec:v",
    "mpeg1video",
    "-b:v",
    config.mpeg.bitrate,
    "-bf",
    "0",
    "-qmin",
    "3",
    "-"
]);
var jpegArgs = avconvInputArgs.concat([
    "-f",
    "image2pipe",
    "-r",
    config.jpeg.framerate,
    "-q:v",
    "1",
    "-"
]);

// Path
var path = require("path");

// Process
var spawn = require("child_process").spawn;

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

// HTTP Server
var server = require("http").Server(app);
server.listen(config.server.http);

// WebSockets
var WebSocket = require("ws");
var createSocketServer = function(name) {
    "use strict";
    var socket = new WebSocket.Server(config.server[name]);
    socket.broadcast = function broadcast(data) {
        socket
            .clients
            .forEach(function(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            });
    };
    return socket;
};
var detectionSocket = createSocketServer("json");
var mpegSocket = createSocketServer("mpeg");

// Computer Vision
var cv = require('opencv');
var imageStream = new cv.ImageStream();
var opencvReady = true;
imageStream.on('data', function(matrix) {
    if (opencvReady) {
        opencvReady = false;
        try {
            matrix
                .detectObject(cv.FACE_CASCADE, {}, function(err, faces) {
                    if (err) {
                        throw err;
                    }
                    var buffer = matrix.toBuffer();
                    var data = JSON.stringify({
                        faces: faces,
                        buffer: buffer.toString('base64')
                    });
                    detectionSocket.broadcast(data);
                    opencvReady = true;
                });
        } catch (err) {
            console.log(err)
            opencvReady = true;
        }
    }
});

// Video Conversion Stream
var mpegStream = spawn("avconv", mpegArgs);
mpegStream
    .stdout
    .on("data", mpegSocket.broadcast);
mpegStream
    .stderr
    .on("data", function(data) {
        "use strict";
        var message = data.toString("utf8");
        console.log(message);
    });

// Frame Extraction Stream
var jpegStream = spawn("avconv", jpegArgs);
jpegStream
    .stdout
    .pipe(imageStream);
jpegStream
    .stderr
    .on("data", function(data) {
        "use strict";
        var message = data.toString("utf8");
        console.log(message);
    });

// Video Capture Stream
var raspividStream = spawn("raspivid", raspividArgs, {
    stdio: ["ignore", "pipe", "inherit"]
});

raspividStream
    .stdout
    .pipe(mpegStream.stdin);

raspividStream
    .stdout
    .pipe(jpegStream.stdin);