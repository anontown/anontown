#!/bin/sh -eu

./bin/wait.sh
npx lerna run migrate --scope @anontown/server --stream
