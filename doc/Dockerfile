FROM node:10.15.3 as base

ENV HOME=/home/app
WORKDIR $HOME

COPY package.json package-lock.json $HOME/
RUN npm ci --no-progress
RUN npx gitbook install

COPY src $HOME/src
RUN npm run build

FROM base as dev

CMD npm start

FROM nginx:1.17.4

COPY nginx.conf /etc/nginx
COPY --from=base /home/app/dist /usr/share/nginx/html
