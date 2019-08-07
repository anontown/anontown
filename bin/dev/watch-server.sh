#!/bin/sh -eu
lerna run build:watch --parallel --scope=@anontown/server --include-filtered-dependencies
