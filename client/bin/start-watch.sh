#!/bin/sh -eu

./bin/codegen-watch.sh &
./bin/build-watch &
./bin/build-watch-bff &
npx lerna run start:watch --scope @anontown/bff --stream
