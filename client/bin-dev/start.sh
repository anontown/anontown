#!/bin/sh -eu

npx lerna run build:watch --parallel --scope @anontown/bff --include-filtered-dependencies \
  & npx lerna run codegen:watch --scope=@anontown/client --stream \
  & npx lerna run build:watch --parallel --scope=@anontown/client --include-filtered-dependencies \
  & npx lerna run start:watch --scope @anontown/bff --stream
