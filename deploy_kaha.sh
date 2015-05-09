#!/bin/bash
# confgure docker to not require sudo

# exit whenever a command returns with a non-zero exit code
set -e
set -o pipefail

DOCKER_USER="kahaco"
APP_NAME="kaha"
DOCKER_IMAGE="${DOCKER_USER}/${APP_NAME}:latest"
APP_PORT=3000
DB_CONTAINER="redis"
PROD_DB_PASS="change_this"
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/change_this"
SLACK_CHANNEL="#deploy"

success=false
env=$1
container="${APP_NAME}_${env}"

# post to slack
function notify {
  echo "$1"
  curl -X POST "$SLACK_WEBHOOK_URL" --data-urlencode 'payload={
    "channel": "'"$SLACK_CHANNEL"'",
    "username": "deploybot",
    "text": "'"$1"'",
    "icon_emoji": ":ghost:"}'
}

# On exit, always do this
function finish {
  if [ "$success" = true ]; then
    notify "Deploy was successful! Check the site just to be sure :)"
    exit 0
  else
    notify "Deploy was unsuccessful :( Check the server logs. \nIf the site is down, you can restore the site by doing 'docker start kaha_prod_previous'"
    exit -1
  fi
}
trap finish EXIT

if [ "$env" != "dev" ] && [ "$env" != "stage" ] && [ "$env" != "prod" ]; then
  echo "usage : deploy_kaha.sh <environment>"
  echo "Available environments are dev, stage and prod"
  exit -1
fi

# switch to the script directory no matter where this is launched from
SCRIPT_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd "$SCRIPT_DIR"

# This could have worked but docker hub builds are slow the hub webhook was not working.
# That's why we build the image locally. Maybe move this to our own private registry later
#echo "Getting the image from docker hub..."
#docker pull "$DOCKER_IMAGE"

echo "Pulling the latest changes to the repo..."
git pull origin master
echo "Building the docker image locally..."
docker build -t "$DOCKER_IMAGE" .
# Better to do this via cron job
#echo "Cleaning up..."
#docker rmi $(docker images -q -f dangling=true)

running_containers=$(docker ps -q --filter="name=${APP_NAME}")

if [ -n "$running_containers" ]; then
  echo "Stopping running app containers..."
  docker stop "$running_containers"
fi

if docker ps -a | grep -q "$container"; then
  container_backup="${container}_previous"

  echo "Removing previous container backup if any..."
  docker ps -a | grep -q "$container_backup" && docker rm "$container_backup"

  echo "Backing up the container..."
  docker rename "$container" "${container}_previous"
fi

echo "Starting new container..."

case "$env" in
  dev)
    # we share the code in the repo with the container so that code changes are visible
    # db container should be already started
    npm install # need to do this since the current dir is shared
    docker run -d --name "$container" -e "NODE_ENV=dev" -p "$APP_PORT:$APP_PORT" -v $(pwd):/kaha --link ${DB_CONTAINER}:db "$DOCKER_IMAGE"
    ;;
  stage)
    # stage is like dev for us without the local db, for quick developer onboarding
    npm install
    docker run -d --name "$container" -e "NODE_ENV=stage" -p "$APP_PORT:$APP_PORT" -v $(pwd):/kaha "$DOCKER_IMAGE"
    # without the code sharing
    #docker run -d --name "$container" -e "NODE_ENV=stage" -p "$APP_PORT:$APP_PORT" "$DOCKER_IMAGE"
    ;;
  prod)
    # with remote db. db password needs to be set
    docker run -d --name "$container" -e "NODE_ENV=prod" -e "DBPWD=${PROD_DB_PASS}" -p "$APP_PORT:$APP_PORT" "$DOCKER_IMAGE" npm run prod
    # with local db. file config/index.js needs to be changed though (see dev config there)
    #docker run -d --name "$container" -e "NODE_ENV=prod" -e "DBPWD=${PROD_DB_PASS}" -p "$APP_PORT:$APP_PORT" --link ${DB_CONTAINER}:db "$DOCKER_IMAGE" npm run prod
    ;;
esac

# sleep to allow the init command in the container to run fully
echo "Pausing things and looking back on life..."
sleep 10

# is a success only if the container is still running after the pause
if docker ps | grep -q "$container"; then
  success=true
fi

