#!/bin/sh
export $(cat .env | xargs)
export $(cat dev-env | xargs)

cd ./packages/server
node ./dist/app.js