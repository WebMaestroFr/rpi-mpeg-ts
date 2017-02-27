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

// Application Messages
var socket = new WebSocket.Server({port: 8082});
socket.broadcast = function broadcast(type, data) {
    var message = JSON.stringify({type: type, data: data});
    socket
        .clients
        .forEach(function(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
};

// MPEG Transport Stream
var mpegSocket = new WebSocket.Server({port: 8084});
mpegSocket.stream = function(data) {
    mpegSocket
        .clients
        .forEach(function(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
};
var mpegStream = null;
mpegSocket.on("connection", function(client) {
    console.log("WebSocket Connection", mpegSocket.clients.size);
    if (null === mpegStream) {
        mpegStream = camera.capture("mpeg");
        mpegStream
            .stdout
            .on("data", mpegSocket.stream);
    }
    client
        .on("close", function() {
            if (0 === mpegSocket.clients.size) {
                camera.stop(mpegStream);
                mpegStream = null;
                console.log("Close WebSocket");
            }
        });
});