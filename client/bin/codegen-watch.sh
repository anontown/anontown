#!/bin/sh -eu

npx lerna run codegen:watch --scope=@anontown/client --stream
