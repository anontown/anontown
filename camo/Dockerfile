FROM alpine/git:v2.24.1 as builder

WORKDIR /home
RUN git clone https://github.com/atmos/camo.git
WORKDIR /home/camo
RUN git checkout e59df56a01c023850962fac16905269d264fba50

FROM node:8.4

WORKDIR /home

COPY --from=builder /home/camo/package.json ./
RUN npm install

COPY --from=builder /home/camo/server.js /home/camo/mime-types.json ./

EXPOSE 8081
USER nobody
CMD ["npm", "start"]
