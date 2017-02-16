# Raspberry Pi MPEG Transport Stream

Capture Raspberry Pi Camera output, convert and stream video, decode and play in browser.

Server-side : Node.js, Express, WebSockets, [`raspivid`](https://www.raspberrypi.org/documentation/raspbian/applications/camera.md) and [`avconv`](https://libav.org/documentation/avconv.html).

Client-side : [JSMpeg](https://github.com/phoboslab/jsmpeg).

## Requirements

- Raspberry Pi [running Raspbian](https://www.raspberrypi.org/documentation/installation/installing-images/README.md) and [connected to your local network](https://www.raspberrypi.org/documentation/configuration/wireless/wireless-cli.md).
- Camera [enabled with `raspi-config`](https://www.raspberrypi.org/documentation/configuration/camera.md).

## Installation

```
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get upgrade -y -q
sudo apt-get install git nodejs libav-tools -y
```

```
git clone https://github.com/WebMaestroFr/rpi-mpeg-ts.git
```