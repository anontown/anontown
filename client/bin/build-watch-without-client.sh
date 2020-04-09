#!/bin/sh -eu

npx lerna run build:watch --parallel --scope=@anontown/client --include-filtered-dependencies --ignore @anontown/client
