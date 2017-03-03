var spawn = require("child_process").spawn;

var Camera = function(options) {

    // Capture options (https://www.raspberrypi.org/documentation/raspbian/applications/camera.md)
    Camera.options = Object.assign({
        nopreview: true,
        inline: true,
        intra: 1,
        timeout: 0,
        width: 640,
        height: 480,
        framerate: 24
    }, options || {}, {output: "-"});

    var args = [];
    // Command arguments
    Object
        .keys(Camera.options)
        .forEach(function(opt) {
            if (Camera.options[opt] || Camera.options[opt] === 0) {
                args.push("--" + opt);
                if (true !== Camera.options[opt]) {
                    args.push(Camera.options[opt]);
                }
            }
        });

    // Capture
    var raspivid = spawn("raspivid", args, {
        stdio: ["ignore", "pipe", "inherit"]
    });

    // H264 stream
    Camera.source = raspivid.stdout;

    // Converters
    Camera._formats = new Map();

    console.log("Camera", Camera.options);
};

Camera.prototype.stream = function(format, capture) {

    var argsOut;
    // Output options (https://libav.org/documentation/avconv.html#Options-1)
    switch (format) {

        case "mpegts":
            // MPEG Transport Stream
            argsOut = [
                "-f",
                "mpegts",
                "-c:v",
                "mpeg1video",
                "-b:v",
                1024 * 1024
            ];
            break;

        case "mjpeg":
            // Motion JPEG
            argsOut = [
                "-f",
                "image2pipe",
                "-c:v",
                "mjpeg",
                "-b:v",
                2048 * 1024,
                "-r",
                12
            ];
            break;

        default:
            // Custom
            argsOut = format;
    }

    if (Camera._formats.has(argsOut)) {
        // Process duplicate
        return Camera
            ._formats
            .get(argsOut);
    }

    var argsIn = [
        "-fflags", "nobuffer", "-probesize", 256 * 1024,
        "-f",
        "h264",
        "-r",
        Camera.options.framerate,
        "-i",
        "pipe:0",
        "-an"
    ];
    // Command arguments
    var args = argsIn.concat(argsOut, ["pipe:1"]);
    // Converter
    var avconv = spawn("avconv", args, {
        stdio: ["pipe", "pipe", "inherit"]
    });

    console.log("Converter\n", args.join(" "));

    if (capture) {
        // Callback
        avconv
            .stdout
            .on("data", capture);
    }

    // Controller
    var stream = {
        start: function() {
            Camera
                .source
                .pipe(avconv.stdin);
            return avconv;
        },
        stop: function() {
            Camera
                .source
                .unpipe(avconv.stdin);
        }
    }
    Camera
        ._formats
        .set(argsOut, stream);
    return stream;
}

module.exports = Camera;