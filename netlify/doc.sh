#!/bin/sh
npm i
npx lerna bootstrap
NODE_ENV=PROD lerna run build --scope @anontown/document
mv packages/document/dist deploy
