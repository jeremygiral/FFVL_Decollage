FROM mhart/alpine-node:latest

ADD package.json /tmp/package.json
ADD decollages.json /tmp/decollages.json
#ADD init.sh /tmp/init.sh

RUN apk update
RUN apk add mongodb-tools
RUN cd /tmp && npm install --update-binary --no-shrinkwrap
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/
WORKDIR /opt/app
ADD . /opt/app

EXPOSE 3000

CMD ["npm","start"]
