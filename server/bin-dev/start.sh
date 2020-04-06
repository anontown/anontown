#!/bin/sh -eu

./bin/wait.sh \
  && npx lerna run codegen:watch --scope @anontown/server --stream \
  & npx lerna run build:watch --parallel --scope @anontown/server --include-filtered-dependencies \
  & npx lerna run start:watch --scope @anontown/server --stream
