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
  docker-compose build
  docker-compose run --rm app npx lerna run migrate --scope @anontown/server
}

stop() {
  docker-compose stop
  docker-compose rm -f
  sudo chown -R $USER data
}

start() {
  docker-compose up -d
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


