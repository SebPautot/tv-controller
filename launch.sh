#! /bin/bash

cd

cd /var/www/tv-controller

sudo git pull --force --allow-unrelated-histories

npm install

pm2 start tv-controller.js