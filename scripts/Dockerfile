FROM mhart/alpine-node:latest

ADD setup.sh /tmp/setup.sh
#ADD wait-for.sh /tmp/wait-for.sh
RUN apk update
RUN apk add mongodb-tools

CMD  cd /tmp && setup.sh
