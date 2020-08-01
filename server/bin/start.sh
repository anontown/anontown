#!/bin/sh -eu

./bin/wait.sh
npx lerna run start --scope @anontown/server --stream
