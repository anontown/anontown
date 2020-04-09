#!/bin/sh -eu

dockerize -wait tcp://$ES_HOST -wait tcp://$REDIS_HOST -wait tcp://$MONGO_HOST -timeout 60s
