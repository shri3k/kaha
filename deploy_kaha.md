# Kaha deployment

Script `deploy_kaha.sh` makes the task of running kaha from docker containers
easier, so that you don't have to remember different docker run options for
different environments.It also has nice features like backing up the previous
container in use and notifying people in slack on successful deploy and app run.

## Requirements

* Install `docker`. Configure docker to not require sudo, following the
  instructions [here](https://docs.docker.com/installation/ubuntulinux/#create-a-docker-group).
* Packages required: `curl` for posting to slack, `npm` to install modules
  locally in `dev` and `stage` environments. Also `git`.
* Configure `deploy_kaha.conf` for slack webhook url, and prod db password.

## Script Usage

    deploy_kaha.sh <environment>

Available environments are `dev`, `stage` and `prod`. In dev and stage, the code
repo is shared with the docker container so that code changes are picked up.
`stage` and `prod` currently use remote redis instances as db backend, but `dev`
requires a redis container running locally, which you can do before running the
script:

    docker run -d --name redis -p 6379:6379 redis

## Managing docker containers

    # list the running containers
    docker ps
    # look at the app logs (stdout)
    docker logs <container_name>
    # stop and start the container
    docker stop <container_name> docker start <container_name>

For more details, read the docker docs.

In case the deploy goes wrong and you want to bring back the site to its
previous state:

    docker stop kaha_prod
    # using the backup made by the script
    docker start kaha_prod_previous

## Automating deployment

The script can be used as the last stage of a mini continuous integration
system, for automated deployments on `git push` to the kaha repo.

We utlize github's webhooks, which sends POST requests to a URL on successful
git push. To implement this URL endpoint, use
[captainhook](https://github.com/bketelsen/captainhook) or implement your own
mini-server.

    $GOPATH/bin/captainhook -listen-addr=<kaha_server_ip> -echo -configdir
    ~/captainhook_configs

We have this running in the kaha server. This endpoint then executes the script
`deploy_kaha.sh` on incoming requests. It is configured to do so only on
requests from the github servers:

```
{
    "scripts": [
        {
            "command": "/home/dkr/kaha/deploy_kaha.sh",
            "args": [
                "stage"
            ]
        }
    ],
    "allowedNetworks": [
        "192.30.252.0/22"
    ]
}
```

This is all we need for now. If you have configured slack notifications, you
will get a message in your channel at the end with deployment status. You can
view the deploy script logs from the github webhooks page.

Parallel to this deploy process, pushes to kaha master also triggers kaha image
build in the [public docker registry](https://registry.hub.docker.com/u/kahaco/kaha/),
to keep the image there up to date. You can
[add](https://docs.docker.com/docker-hub/builds/#automated-builds-from-github)
docker service in github to achieve this.

For docker deployments, the norm seems to be to
[trigger](http://blog.gopheracademy.com/advent-2014/easy-deployment/)
[image](http://nathanleclaire.com/blog/2014/08/17/automagical-deploys-from-docker-hub/)
builds in docker hub first, and then catch the webhook from there to run the app
from the public docker image. However, the webhook functionality from docker hub
was not working for us and also docker hub build was a serious bottleneck,
taking as much half an hour for the build to finish sometimes. If this situation
improves, the deploy script can be modifed to pull the public image instead of
building the image locally, or you can host your own private docker registry.

## TODO

* Only trigger deploy on pushes to master
* Deploy without downtime (nginx proxy to balance between the new and old docker containers)
* Validation for local db setup
* Better logging
* Logfile upload to slack?
* Add codeship intgeration to the deploy workflow when we add tests
