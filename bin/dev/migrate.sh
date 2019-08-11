#!/bin/sh -eu
python3 docker-compose.py dev | docker-compose -f - run --rm app npx lerna run migrate --scope @anontown/server
