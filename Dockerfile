FROM ubuntu
MAINTAINER Kaha Team
LABEL Description="Image for kaha"

RUN apt-get update

# install node
RUN \
  apt-get install -y wget && \
  cd /tmp && \
  wget http://nodejs.org/dist/v0.12.2/node-v0.12.2-linux-x64.tar.gz && \
  tar --strip-components 1 -xvzf node-v0.12.2-linux-x64.tar.gz -C /usr/local

# install redis
#RUN apt-get install -y redis-server
#RUN service redis-server start

ADD . /kaha
WORKDIR /kaha

RUN npm install

EXPOSE 3000

ENV NODE_ENV dev

CMD ["npm", "start"]
#CMD ["node", "./bin/www"]
