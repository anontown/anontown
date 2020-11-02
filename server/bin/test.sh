#!/bin/sh -eu

./bin/wait.sh
npx lerna run test --scope @anontown/server --stream
