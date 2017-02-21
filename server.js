// Configuration
var config = require("./config.json");

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

// WebSocket Server
var WebSocket = require("ws");
var cameraSocket = new WebSocket.Server(config.server.ws);
cameraSocket.broadcast = function broadcast(data) {
    "use strict";
    cameraSocket
        .clients
        .forEach(function(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
};

// Index Page
app.get("/", function(req, res) {
    "use strict";
    res.render("index", config);
});

// Video Conversion Stream
var avconvStream = spawn("avconv", [
    "-probesize",
    config.video.probesize,
    "-fflags",
    "nobuffer",
    "-f",
    "h264",
    "-r",
    config.video.framerate,
    "-i",
    "-",
    "-an",
    "-f",
    "mpegts",
    "-codec:v",
    "mpeg1video",
    "-b:v",
    config.video.bitrate,
    "-bf",
    "0",
    "-qmin",
    "3",
    "-"
]);

avconvStream
    .stdout
    .on("data", cameraSocket.broadcast);

avconvStream
    .stderr
    .on("data", function(data) {
        "use strict";
        var message = data.toString("utf8");
        console.log(message);
    });

// Video Capture Stream
var raspividStream = spawn("raspivid", [
    "--nopreview",
    "--hflip",
    "--vflip",
    "--inline",
    "--timeout",
    "0",
    "--framerate",
    config.video.framerate,
    "--width",
    config.video.size.width,
    "--height",
    config.video.size.height,
    "--output",
    "-"
], {
    stdio: ["ignore", avconvStream.stdin, "inherit"]
});