#!/bin/sh -eu

./bin/wait.sh \
  && ./bin/codegen-watch.sh \
  & ./bin/build-watch.sh \
  & npx lerna run start:watch --scope @anontown/server --stream
