FROM node:10.15.3

ENV HOME=/home/app
ENV APP_HOME=$HOME/.anontown

WORKDIR $APP_HOME

RUN apt update && \
  apt install -y wget

ENV DOCKERIZE_VERSION=v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

COPY package.json package-lock.json $APP_HOME/
RUN npm ci --no-progress
COPY lerna.json $APP_HOME/
COPY shared $APP_HOME/shared
COPY packages $APP_HOME/packages
RUN npx lerna bootstrap --ci --no-progress \
  &&  npx lerna run build --scope @anontown/server

CMD dockerize -wait tcp://$ES_HOST -wait tcp://$REDIS_HOST -wait tcp://$MONGO_HOST \
  && npx lerna run start --scope @anontown/server
