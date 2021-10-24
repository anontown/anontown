#!/bin/sh -eu

dockerize -wait tcp://$ES_HOST -wait tcp://$REDIS_HOST -wait tcp://$MONGO_HOST -wait tcp://$(echo $DATABASE_URL | sed -r 's!.*@(.+)\/.*!\1!') -timeout 60s
