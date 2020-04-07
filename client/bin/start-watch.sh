#!/bin/sh -eu

./bin/build-watch-bff.sh \
  & ./bin/codegen-watch.sh \
  & ./bin/build-watch.sh \
  & npx lerna run start:watch --scope @anontown/bff --stream
