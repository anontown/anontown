#!/bin/sh
npm i
npx lerna bootstrap
ENV_NAME=prod lerna exec --scope @anontown/client -- npm run build
mv packages/client/dist deploy
