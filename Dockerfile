FROM node:10.15.3

ENV HOME=/home/app
ENV APP_HOME=$HOME/.anontown

WORKDIR $APP_HOME

COPY package.json package-lock.json $APP_HOME/
RUN npm i --no-progress
COPY lerna.json $APP_HOME/
COPY packages $APP_HOME/packages
RUN $(npm bin)/lerna bootstrap
RUN $(npm bin)/lerna exec --scope @anontown/server -- npm run build

ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh $APP_HOME/wait-for-it.sh
RUN chmod +x ./wait-for-it.sh

CMD ./wait-for-it.sh -t 0 $ES_HOST -- $(npm bin)/lerna exec --scope @anontown/server -- npm start