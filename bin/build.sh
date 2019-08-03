#!/bin/sh -eu

$(npm bin)/lerna exec --scope @anontown/route -- npm run build
$(npm bin)/lerna exec --scope @anontown/server -- npm run build
