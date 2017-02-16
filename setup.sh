#!/bin/bash

curl -sL https://deb.nodesource.com/setup_6.x | bash -

apt-get upgrade -y -q
apt-get install git nodejs libav-tools -y