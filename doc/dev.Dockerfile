FROM node:10.15.3 as builder

ENV HOME=/home/app
WORKDIR $HOME

COPY package.json package-lock.json $HOME/
RUN npm ci --no-progress
COPY src $HOME/src

CMD npm start
