#!/bin/bash
echo "################################################"
echo "Build anique-api-app image"
echo "################################################"

sudo docker build -t anique-api-app .

echo "################################################"
echo "Deletes the old dangling images"
echo "################################################"

sudo docker 2>/dev/null rmi -f $(docker images -q --filter "dangling=true")
sudo docker images --quiet --filter=dangling=true | xargs --no-run-if-empty docker rmi -f

docker images