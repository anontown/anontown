#!/bin/sh -eu

./wait.sh && npx lerna run migrate --scope @anontown/server --stream
