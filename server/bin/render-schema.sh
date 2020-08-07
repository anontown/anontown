#!/bin/sh -eu

npx lerna run render-schema --scope @anontown/server --loglevel=silent -- --silent
