#!/bin/sh
cd client
npm ci --no-progress
npx lerna bootstrap
ENV_NAME=prod lerna run build --scope @anontown/client --include-filtered-dependencies
mv packages/client/dist ../deploy
