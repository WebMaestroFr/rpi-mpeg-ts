var FixedQueue = function(size) {
    "use strict";
    var queue = [];
    queue.push = function() {
        var result = Array
            .prototype
            .push
            .apply(queue, arguments);
        if (queue.length > size) {
            Array
                .prototype
                .splice
                .call(queue, 0, queue.length - size);
        }
        return result;
    };
    return queue;
};
var frameData = new FixedQueue(16);

var bitrateChart = new Morris.Line({
    element: "stream-chart-bitrate",
    data: frameData,
    xkey: "frame",
    ykeys: ["bitrate"],
    labels: ["Bitrate"],
    hideHover: true,
    parseTime: false
});
var fpsChart = new Morris.Line({
    element: "stream-chart-fps",
    data: frameData,
    xkey: "frame",
    ykeys: ["fps"],
    labels: ["Frames Per Second"],
    hideHover: true,
    parseTime: false
});
var qChart = new Morris.Line({
    element: "stream-chart-q",
    data: frameData,
    xkey: "frame",
    ykeys: ["q"],
    labels: ["Quality (VBR)"],
    hideHover: true,
    parseTime: false
});

var url = "ws://" + document.location.hostname;

var socket = new WebSocket(url + ":8083");
socket.addEventListener("message", function(event) {
    var data = JSON.parse(event.data);
    if (data.hasOwnProperty("frame")) {
        frameData.push(data);
        bitrateChart.setData(frameData);
        fpsChart.setData(frameData);
        qChart.setData(frameData);
    }
});