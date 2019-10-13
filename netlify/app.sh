#!/bin/sh
cd client
npm i
npx lerna bootstrap
ENV_NAME=prod lerna run build --scope @anontown/client --include-filtered-dependencies
mv packages/client/dist ../deploy
