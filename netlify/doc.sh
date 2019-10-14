#!/bin/sh
cd document
npm ci --no-progress
npm run build
mv dist ../deploy
