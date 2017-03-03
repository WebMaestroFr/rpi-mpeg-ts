var app = {
    url: "ws://" + document.location.hostname
};

app.socket = new WebSocket(app.url + ":8082");
app
    .socket
    .addEventListener('message', function(e) {
        var message = JSON.parse(e.data);
        var event = new CustomEvent(message.type);
        event.data = message.data;
        document.dispatchEvent(event);
    });