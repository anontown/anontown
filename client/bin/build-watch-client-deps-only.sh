#!/bin/sh -eu

npx lerna run build:watch --parallel $(npx lerna ls -a --scope=@anontown/client --include-filtered-dependencies | awk -F' ' '{print $1}' | grep -v ^@anontown/client$ | awk '{print "--scope=" $0}')
