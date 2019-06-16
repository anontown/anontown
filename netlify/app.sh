#!/bin/sh
npm i
npx lerna bootstrap
lerna exec --scope @anontown/client -- npm run build
mv packages/client/dist deploy
