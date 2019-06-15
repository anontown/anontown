#!/bin/sh
npm i
npx lerna bootstrap
NODE_ENV=PROD lerna exec --scope @anontown/document -- npm run build
mv packages/document/dist deploy