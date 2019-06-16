#!/bin/sh
export $(cat .env | xargs)
export $(cat dev-env | xargs)

npx lerna exec --scope @anontown/server -- $@

