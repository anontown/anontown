#!/bin/sh
npm i
npx lerna bootstrap
lerna run build --scope @anontown/route
ENV_NAME=prod lerna run build --scope @anontown/client
mv packages/client/dist deploy
