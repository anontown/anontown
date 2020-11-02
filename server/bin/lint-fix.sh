#!/bin/sh -eu

npx eslint --ext .ts,.tsx --fix packages/*/src
