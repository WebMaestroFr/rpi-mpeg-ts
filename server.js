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
var jsonSocket = new WebSocket.Server({port: 8082});
jsonSocket.broadcast = function(type, data) {
    var message = JSON.stringify({type: type, data: data});
    jsonSocket
        .clients
        .forEach(function(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
};

// Camera
var Camera = require("./camera");
var camera = new Camera({verbose: true, hflip: true, vflip: true, saturation: -100});

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
    // console.log("\nWebSocket Connection", mpegSocket.clients.size);
    if (1 === mpegSocket.clients.size) {
        mpegStream.start();
        // console.log("\nOpen MPEG Stream");
    }
    client
        .on("close", function() {
            if (0 === mpegSocket.clients.size) {
                mpegStream.stop();
                // console.log("\nClose MPEG Stream");
            }
        });
});

// Computer Vision
var cv = require('opencv');

var opencvReady = true;
var frameStream = camera.stream("jpeg", function(data) {
    if (opencvReady) {
        opencvReady = false;
        try {
            cv
                .readImage(data, function(err, matrix) {
                    if (err) {
                        throw err;
                    }
                    if (matrix.width() < 1 || matrix.height() < 1) {
                        console.log(matrix);
                        throw new Error('Image has no size.');
                    }
                    matrix
                        .detectObject(cv.FACE_CASCADE, {
                            scale: 1.05,
                            neighbors: 9,
                            min: [64, 64]
                        }, function(err, faces) {
                            if (err) {
                                throw err;
                            }
                            // console.log("\nDetection", faces);
                            jsonSocket.broadcast("detection", faces);
                            opencvReady = true;
                        });
                });
        } catch (err) {
            console.error("ERROR", err);
            frameStream.stop();
        }
    }
});

// HTTP Server
var server = require("http").Server(app);
server.listen({
    "port": 8080
}, function() {
    frameStream.start();
});