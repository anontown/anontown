#!/bin/sh -eu
DC_ENV=dev python3 docker-compose.py | docker-compose -f - run --rm app npx lerna run migrate --scope @anontown/server
