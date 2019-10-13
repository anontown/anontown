#!/bin/sh -eu
DCDY_MODE=dev dcdy run --rm app npx lerna run migrate --scope @anontown/server
