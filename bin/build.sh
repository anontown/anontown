#!/bin/sh -eu

$(npm bin)/lerna exec --scope @anontown/server -- npm run build
