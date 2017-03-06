// Computer Vision
var cv = require("opencv");

var _OPENCV_FLAG = true;

console.log("Vision");

module.exports = {
    read: function(data, callback) {
        try {
            cv
                .readImage(data, function(err, matrix) {
                    if (err) {
                        console.error("Read Matrix", err);
                    } else {
                        callback(matrix);
                    }
                });
        } catch (err) {
            console.error("Read Image", err);
        }
    },
    detect: function(matrix, cascade, options, callback) {
        if (_OPENCV_FLAG) {
            _OPENCV_FLAG = false;
            // switch (cascade) {     default:
            cascade = cv.FACE_CASCADE;
            // }
            try {
                matrix
                    .detectObject(cascade, options, function(err, faces) {
                        _OPENCV_FLAG = true;
                        if (err) {
                            console.error("Detect Faces", err);
                        } else {
                            callback(faces);
                        }
                    });
            } catch (err) {
                _OPENCV_FLAG = true;
                console.error("Detect Object", err);
            }
        }
    }
};