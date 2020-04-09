#!/bin/sh -eu

npx lerna run build:watch --parallel --scope=@anontown/client --scope @anontown/bff --include-filtered-dependencies
