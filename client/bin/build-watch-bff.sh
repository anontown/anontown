#!/bin/sh -eu

npx lerna run build:watch --parallel --scope @anontown/bff --include-filtered-dependencies
