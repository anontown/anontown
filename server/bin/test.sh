#!/bin/sh -eu

./bin/wait.sh

cd packages/server
npx prisma migrate deploy
npm test
