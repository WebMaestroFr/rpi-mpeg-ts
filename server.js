// Configuration
var config = {
    framerate: 24,
    bitrate: "1024k",
    size: {
        width: 640,
        height: 480
    },
    port: {
        http: 8080,
        camera: {
            data: 8082,
            message: 8083
        }
    },
    debug: false
};

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
    var index = path.join(__dirname, config.debug
        ? "index.debug.html"
        : "index.html");
    res.sendFile(index);
});

// HTTP Server
var server = require("http").Server(app);
server.listen(config.port.http, function() {
    "use strict";
    console.log("HTTP Server");
});

// WebSockets
var WebSocket = require("ws");
var broadcast = function(ws, message) {
    "use strict";
    ws
        .clients
        .forEach(function(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
};

var cameraDataSocket = new WebSocket.Server({port: config.port.camera.data, perMessageDeflate: false});

// Video Conversion Stream
var avconvStream = spawn("avconv", [
    "-fflags",
    "nobuffer",
    "-f",
    "h264",
    "-r",
    config.framerate,
    "-i",
    "-",
    "-an",
    "-f",
    "mpegts",
    "-codec:v",
    "mpeg1video",
    "-b:v",
    config.bitrate,
    "-bf",
    "0",
    "-qmin",
    "3",
    "-"
]);

avconvStream
    .stdout
    .on("data", function(data) {
        "use strict";
        broadcast(cameraDataSocket, data);
    });

// Video Capture Stream
var raspividStream = spawn("raspivid", [
    "--nopreview",
    "--verbose",
    "--hflip",
    "--vflip",
    "--inline",
    "--timeout",
    "0",
    "--framerate",
    config.framerate,
    "--width",
    config.size.width,
    "--height",
    config.size.height,
    "--saturation",
    "-100",
    "--output",
    "-"
], {
    stdio: ["ignore", "pipe", "inherit"]
});

raspividStream
    .stdout
    .pipe(avconvStream.stdin);

// Debug
if (config.debug) {
    var cameraMessageSocket = new WebSocket.Server({port: config.port.camera.message});

    avconvStream
        .stderr
        .on("data", function(data) {
            "use strict";
            var message = data.toString("utf8");
            var r = /([a-z]+)=\s*([0-9.]+)/g;
            var match = null;
            var info = {};
            while (match = r.exec(message)) {
                info[match[1]] = parseFloat(match[2]);
            }
            if (Object.keys(info).length) {
                broadcast(cameraMessageSocket, JSON.stringify(info));
            } else {
                console.log(message);
            }
        });
}