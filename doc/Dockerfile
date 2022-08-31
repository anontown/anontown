FROM node:16.17.0-alpine

ENV HOME=/home/app
WORKDIR $HOME

COPY package.json package-lock.json $HOME/
RUN npm ci --no-progress
RUN npx gitbook install

COPY src $HOME/src
RUN npm run build
CMD npm start
