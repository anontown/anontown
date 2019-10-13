#!/bin/sh -eu
DATE=$(date +"%Y%m%d%H%M%S")

backup() {
  mkdir /tmp/$DATE
  cp -r  data /tmp/$DATE/data
  cp .env /tmp/$DATE/.env
}

upload() {
  zip -r /tmp/$DATE.zip /tmp/$DATE
  skicka upload /tmp/$DATE.zip anontown-bak/$DATE.zip
}

update() {
  git pull
  DCDY_MODE=prod dcdy build
  DCDY_MODE=prod dcdy run --rm app npx lerna run migrate --scope @anontown/server
}

stop() {
  DCDY_MODE=prod dcdy stop
  DCDY_MODE=prod dcdy rm -f
  sudo chown -R $USER data
}

start() {
  DCDY_MODE=prod dcdy up -d
}

case $1 in
  "update" )
    stop
    backup
    update
    start
    upload ;;
  "backup" )
    stop
    backup
    start
    upload ;;
  * ) echo "unknown command: $1" ;;
esac


