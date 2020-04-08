#!/bin/sh -eu

npx lerna run lint:fix --scope @anontown/client --stream
