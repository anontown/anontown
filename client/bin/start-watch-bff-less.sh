#!/bin/sh -eu

./bin/codegen-watch.sh \
  & ./bin/build-watch-client-deps-only.sh \
  & npx lerna run build-and-start:watch --scope @anontown/client --stream
