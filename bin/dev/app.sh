#!/bin/bash
if [ ! -t 0 ]; then
  exit 1
fi

exec 3< <(python3 docker-compose.py dev | docker-compose -f - up)

trap 'stty sane; exit;' INT
stty -echo -icanon time 0 min 0

keypress=''
while true; do
  read <&3 line
  if [ -n "$line" ]; then
    echo "$line"
  else
    sleep 1
  fi

  read keypress
  echo $keypress
  if [ "$keypress" = ":" ]; then
    read -t 10 cmd
    if [ "$cmd" = "r" ]; then
      python3 docker-compose.py dev | docker-compose -f - restart app
    fi
  fi
done

stty sane
