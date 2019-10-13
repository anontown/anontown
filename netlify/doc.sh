#!/bin/sh
cd document
npm i
npm run build
mv dist ../deploy
