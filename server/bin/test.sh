#!/bin/sh -eu

./bin/wait.sh

cd packages/server && npx prisma migrate deploy
npx lerna run test --scope @anontown/server --stream
