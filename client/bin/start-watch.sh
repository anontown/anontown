#!/bin/sh -eu

./bin/codegen-watch.sh \
  & ./bin/build-watch.sh \
  & npx lerna run start:watch --scope @anontown/bff --stream
