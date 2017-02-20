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

## Capture and Stream

```bash
npm start
```
Soon after, the video stream is available on [port 8080](http://raspberrypi.local:8080/).