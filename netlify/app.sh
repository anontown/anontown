#!/bin/sh
npm i
npx lerna bootstrap
NODE_ENV=PROD lerna exec --scope @anontown/client -- npm run build
mv packages/client/dist deploy