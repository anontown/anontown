#!/bin/sh -eu
cd server
DCDY_MODE=dev dcdy run --rm server npx lerna run migrate --scope @anontown/server
