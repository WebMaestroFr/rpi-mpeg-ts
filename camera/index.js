var spawn = require("child_process").spawn;

var Camera = function(options) {

    var camera = this;

    camera.options = Object.assign({
        nopreview: true,
        inline: true,
        timeout: 0,
        width: 640,
        height: 480,
        framerate: 30
    }, options || {}, {output: "-"});

    var args = [];
    Object
        .keys(camera.options)
        .forEach(function(opt) {
            if (camera.options[opt] || camera.options[opt] === 0) {
                args.push("--" + opt);
                if (true !== camera.options[opt]) {
                    args.push(camera.options[opt]);
                }
            }
        });

    camera.raspivid = spawn("raspivid", args, {input: "ignore"});
    process.on("exit", camera.raspivid.kill);

    camera
        .raspivid
        .stderr
        .on("data", function(data) {
            "use strict";
            var message = data.toString("utf8");
            console.log(message);
        });

    console.log("Camera", args);
};

Camera.prototype.capture = function(mode) {

    var camera = this;

    var argsIn = [
        "-fflags", "nobuffer", "-probesize", 128 * 1024,
        "-f",
        "h264",
        "-r",
        camera.options.framerate,
        "-i",
        "-",
        "-an"
    ];

    var format;

    switch (mode) {

        case "mpeg":
            format = [
                "-f",
                "mpegts",
                "-codec:v",
                "mpeg1video",
                "-r",
                24,
                "-b:v",
                1024 * 1024,
                "-bf",
                "0",
                "-qmin",
                "3"
            ];
            break;

        case "image":
            format = [
                "-f",
                "image2pipe",
                "-r",
                6,
                "-q:v",
                "1"
            ];
            break;

        default:
            format = mode;
    }

    var argsOut = argsIn.concat(format, ["-"]);
    var stream = spawn("avconv", argsOut);

    console.log("Camera Capture", argsOut);

    camera
        .raspivid
        .stdout
        .pipe(stream.stdin);
    stream
        .stderr
        .on("data", function(data) {
            "use strict";
            var message = data.toString("utf8");
            console.log(message);
        });

    return stream;
};

Camera.prototype.stop = function(stream) {
    this
        .raspivid
        .stdout
        .unpipe(stream.stdin);
    stream.kill();

    console.log("Camera Stop Stream");
};

module.exports = Camera;