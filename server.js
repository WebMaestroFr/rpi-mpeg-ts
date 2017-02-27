// Camera
var Camera = require("./camera");
var camera = new Camera({verbose: true, hflip: true, vflip: true});

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

// HTTP Server
var server = require("http").Server(app);
server.listen({"port": 8080});

// WebSockets
var WebSocket = require("ws");

// MPEG Transport Stream
var mpegSocket = new WebSocket.Server({port: 8084});
mpegSocket.broadcast = function(data) {
    mpegSocket
        .clients
        .forEach(function(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
};
var mpegStream = camera.stream("mpeg", mpegSocket.broadcast);
mpegSocket.on("connection", function(client) {
    console.log("\nWebSocket Connection", mpegSocket.clients.size);
    if (1 === mpegSocket.clients.size) {
        mpegStream.start();
        console.log("\nOpen MPEG Stream");
    }
    client
        .on("close", function() {
            if (0 === mpegSocket.clients.size) {
                mpegStream.stop();
                console.log("\nClose MPEG Stream");
            }
        });
});