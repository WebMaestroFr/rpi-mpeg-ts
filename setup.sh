#!/bin/bash

cd "$(dirname "$0")"

[[ "$(whoami)" != "root" ]] && echo "Please run script as root or sudo." && exit

curl -sL https://deb.nodesource.com/setup_6.x | bash -

apt-get upgrade -y -q
apt-get install git nodejs libav-tools libopencv-dev -y

npm install