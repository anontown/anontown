FROM alpine/git:v2.24.1 as builder

WORKDIR /home
RUN git clone https://github.com/atmos/camo.git
WORKDIR /home/camo
RUN git checkout e59df56a01c023850962fac16905269d264fba50

FROM node:8.4

RUN mkdir -p /opt/camo/
WORKDIR /opt/camo/

COPY --from=builder /home/camo/package.json /opt/camo/
COPY --from=builder /home/camo/server.js /opt/camo/
COPY --from=builder /home/camo/mime-types.json /opt/camo/

EXPOSE 8081

RUN npm install
USER nobody
CMD ["npm", "start"]
