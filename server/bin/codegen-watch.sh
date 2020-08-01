#!/bin/sh -eu

npx lerna run codegen:watch --parallel --scope @anontown/server --include-filtered-dependencies
