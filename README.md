# Raspberry Pi MPEG Transport Stream

Capture Raspberry Pi Camera output, convert and stream video, decode and play in browser.

Express, WebSockets, [`raspivid`](https://www.raspberrypi.org/documentation/raspbian/applications/camera.md), [`avconv`](https://libav.org/documentation/avconv.html) and [JSMpeg](https://github.com/phoboslab/jsmpeg).

## Requirements

- Raspberry Pi [running Raspbian](https://www.raspberrypi.org/documentation/installation/installing-images/README.md) and [connected to your local network](https://www.raspberrypi.org/documentation/configuration/wireless/wireless-cli.md).
- [Camera enabled](https://www.raspberrypi.org/documentation/configuration/camera.md).

## Installation

```bash
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get upgrade -y -q
sudo apt-get install git nodejs libav-tools -y

git clone https://github.com/WebMaestroFr/rpi-mpeg-ts.git
cd rpi-mpeg-ts
npm install
```

## Start Capture

```bash
npm start
```
The video stream is then ready to play on [port 8080](http://raspberrypi.local:8080/).


## Server-Side Module

The `./camera` module is converting the *h264* capture into a `"mpeg"` stream.

```javascript
var Camera = require("./camera");
var camera = new Camera({width: 640, height: 480, vflip: true});

var mpegStream = camera.stream("mpeg", mpegSocket.broadcast);
```