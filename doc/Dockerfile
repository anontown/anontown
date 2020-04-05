FROM node:10.15.3 as builder

ENV HOME=/home/app
WORKDIR $HOME

COPY package.json package-lock.json $HOME/
RUN npm ci --no-progress
RUN npx gitbook install

COPY README.md SUMMARY.md $HOME/
COPY src $HOME/src
RUN npm run build

FROM nginx:1.17.4

COPY nginx.conf /etc/nginx
COPY --from=builder /home/app/dist /usr/share/nginx/html
