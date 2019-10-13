#!/bin/sh -eu
DATE=$(date +"%Y%m%d%H%M%S")

update-before-stop() {
  git pull origin release
  docker-compose pull
}

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
    update-before-stop
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


