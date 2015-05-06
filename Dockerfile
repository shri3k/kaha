FROM ubuntu
MAINTAINER Kaha Team
LABEL Description="Image for kaha: quick relief lookup for nepal earthquake"

# install node
ADD http://nodejs.org/dist/v0.12.2/node-v0.12.2-linux-x64.tar.gz /tmp/
RUN cd /tmp && tar --strip-components 1 -xvzf node-v0.12.2-linux-x64.tar.gz -C /usr/local

ADD . /kaha
WORKDIR /kaha

RUN npm install

EXPOSE 3000
ENV NODE_ENV stage
CMD ["npm", "start"]
