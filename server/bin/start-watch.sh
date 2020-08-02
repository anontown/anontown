#!/bin/sh -eu

./bin/build-watch.sh &
./bin/codegen-watch.sh &

./bin/wait.sh
npx lerna run start:watch --scope @anontown/server --stream
