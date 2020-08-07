#!/bin/sh -eu

./bin/wait.sh
npx jest --runInBand --forceExit
