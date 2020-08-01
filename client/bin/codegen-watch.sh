#!/bin/sh -eu

npx lerna run codegen:watch --parallel --scope=@anontown/client --include-filtered-dependencies
