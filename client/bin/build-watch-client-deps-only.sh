#!/bin/sh -eu

npx lerna run build:watch --parallel $(npx lerna ls --scope=@anontown/client --include-filtered-dependencies | awk '{print "--scope=" $0}')
