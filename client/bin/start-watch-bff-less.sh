#!/bin/sh -eu

./bin/codegen-watch.sh \
  & npx lerna run build-and-start:watch --scope @anontown/client --stream
