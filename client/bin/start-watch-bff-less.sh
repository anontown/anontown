#!/bin/sh -eu

./bin/codegen-watch.sh \
  & ./bin/build-watch-without-client.sh \
  & npx lerna run build-and-start:watch --scope @anontown/client --stream
