#!/bin/bash
# confgure docker to not require sudo

# exit whenever a command returns with a non-zero exit code
set -e 
set -o pipefail

success=false
env=$1

DOCKER_USER="kahaco"
APP_NAME="kaha"
DOCKER_IMAGE="${DOCKER_USER}/${APP_NAME}:latest"
APP_PORT=3000

# On exit, always do this
function finish {
  if [ "$success" = true ]; then
    echo "Deploy was successful!"
    exit 0
  else
    echo "Deploy was un-successful :("
    exit -1
  fi
}
trap finish EXIT

if [ -z "$env" ]
  then
    echo "usage : deploy_kaha.sh <environment>" 
    echo "Available environments are dev, stage and prod"
	  exit -1
fi

container="${APP_NAME}_${env}"

echo "Getting the image from docker hub"
docker pull "$DOCKER_IMAGE"


if docker ps | grep -q "$container"; then
  echo "Stopping running container"
  docker stop "$container"

  echo "Backing up the container"
  docker rename "$container" "${container}_previous"
fi

echo "Starting new container"
docker run -d --name "$container" -p "$APP_PORT:$APP_PORT" "$DOCKER_IMAGE"

success=true
