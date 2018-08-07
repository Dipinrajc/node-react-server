#!/usr/bin/env bash

echo "The running containers"

docker ps

echo "Bring down containers"
docker-compose down

echo "The running containers after brought down"
docker ps

echo "Removing containers"
docker-compose rm -f
