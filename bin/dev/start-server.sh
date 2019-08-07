#!/bin/sh -eu
python3 docker-compose.py dev | docker-compose -f - up
