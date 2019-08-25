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
  python3 docker-compose.py prod | docker-compose -f - build
  python3 docker-compose.py prod | docker-compose -f - run --rm app npx lerna run migrate --scope @anontown/server
}

stop() {
  python3 docker-compose.py prod | docker-compose -f - stop
  python3 docker-compose.py prod | docker-compose -f - rm -f
  sudo chown -R $USER data
}

start() {
  python3 docker-compose.py prod | docker-compose -f - up -d
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


