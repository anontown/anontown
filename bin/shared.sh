#!/bin/sh -eu
cat ./shared.conf | while read line
do
  rm -rf $line/shared
  mkdir $line/shared
  ls $line/shared-ln | while read file
  do
    cp -RL $line/shared-ln/$file $line/shared/$file
  done
done
