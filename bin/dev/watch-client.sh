#!/bin/sh -eu
ENV_NAME=$1 lerna run build:watch --parallel --scope=@anontown/client --include-filtered-dependencies
