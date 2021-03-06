var spawn = require("child_process").spawn;

var Camera = function(options) {

    // Capture options (https://www.raspberrypi.org/documentation/raspbian/applications/camera.md)
    Camera.options = Object.assign({
        nopreview: true,
        inline: true,
        timeout: 0,
        width: 640,
        height: 480,
        framerate: 30
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
};

Camera.prototype.stream = function(format, cb) {

    var argsOut;
    // Output options (https://libav.org/documentation/avconv.html#Options-1)
    switch (format) {

        case "mpeg":
            // Video
            argsOut = [
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
            // Frame by frame
            argsOut = [
                "-f",
                "image2pipe",
                "-r",
                6,
                "-q:v",
                "1"
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
        "-fflags", "nobuffer", "-probesize", 128 * 1024,
        "-f",
        "h264",
        "-r",
        Camera.options.framerate,
        "-i",
        "-",
        "-an"
    ];
    // Command arguments
    var args = argsIn.concat(argsOut, ["-"]);
    // Converter
    var avconv = spawn("avconv", args, {
        stdio: ["pipe", "pipe", "inherit"]
    });
    avconv
        .stdout
        .on("error", function(err) {
            console.log(err);
        });

    if (cb) {
        // Callback
        avconv
            .stdout
            .on("data", cb);
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