#!/bin/sh -eu

npx lerna run build:watch --parallel --scope @anontown/server --include-filtered-dependencies
