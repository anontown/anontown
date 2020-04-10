#!/bin/sh -eu

./bin/codegen-watch.sh \
  & ./bin/build-watch.sh \
  & npx lerna run build-and-start:watch --scope @anontown/bff --stream
