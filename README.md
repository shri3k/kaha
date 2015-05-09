# kaha

quick relief lookup for nepal earthquake

## Run the app locally

### Install dependencies

    npm install

### Run the app in dev mode

    npm run build-dev-watch

This should build a bundle.js file for your app to run in dev mode, plus start
up the server as well. The bundle.js file is automatically rebuild on any change
made to your js files.

Access the app at http://localhost:3000/

**NOTE**: When you do `npm run start` or `node bin/www` (which `build-dev-watch`
uses) then by default it'll run on staging db, so that people don't have to
setup their local db installation.

### Run on prod db

    npm run prod

but you'll need to set a db environment variable (DBPWD) for db passwd. Contact
the contributors in this repo for the db pass.

## Run using docker

To ensure uniform environments across all of dev, staging and prod for all
developers/testers (and quickly get the app up and running), we can run kaha
from docker.

First install docker following the instructions
[here](https://docs.docker.com/installation/).

kaha image is [public](https://registry.hub.docker.com/u/kahaco/kaha/) so all
you have to do is:

    docker run kahaco/kaha

This is set up so that the kaha app runs from http://localhost:3000, with the
remote staging db as backend (so that people don't have to configure it on their
own.)

If you are on ubuntu, you might have to do some
[configuration](https://docs.docker.com/installation/ubuntulinux/#enable-ufw-forwarding)
work to make the port 3000 accessible. You can get around this by explicitly
mapping the container/host ports (-p option, see below).

If you want to develop with the docker containers, clone the repo and run this
from the repo root directory:

    docker run --name kaha_stage -v $(pwd):/kaha -p 3000:3000 kahaco/kaha

This creates a docker container called `kaha_stage` based on the kaha image,
with the repo dir used as a shared volume inside the container (so that code
changes are picked up).

If you want your own local db setup, you can use run `deploy_kaha.sh dev` (which
has some other nice features, read [deploy notes](deploy_notes.md). This is the
recommended way, but docker-compose support is also available.

    sudo pip install docker-compose && docker-compose up

## LICENSE

```
The MIT License (MIT)

Copyright (c) 2015 kaha.co

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
