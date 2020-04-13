#!/bin/sh -eu

./bin/codegen-watch.sh \
  & ./bin/build-watch.sh \
  & ./bin/build-watch-bff.sh \
  & npx lerna run start:watch --scope @anontown/bff --stream
